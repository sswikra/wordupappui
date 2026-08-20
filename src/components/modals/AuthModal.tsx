// google ile giriş ekranı
// src/components/modals/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';
import { Cloud, Award, BookOpen, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import { AuthService } from '../../services/authService';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

// Tarayıcı oturumunu tamamlamak için
WebBrowser.maybeCompleteAuthSession();

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void;
    darkMode?: boolean;
    canDismiss?: boolean; // Kullanıcı bu ekranı kapatıp devam edebilir mi?
}

const { width } = Dimensions.get('window');

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    onLoginSuccess,
    darkMode = false,
    canDismiss = true,
}) => {
    const theme = getTheme(darkMode);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Google OAuth Hook
  const GOOGLE_CLIENT_ID = '612159107867-8vm5n6foo16d6mjchvppmeqdqkk0j6c6.apps.googleusercontent.com';

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    responseType: ResponseType.IdToken,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: 'https://auth.expo.io/@walkerceng44/wordmem-vocabulary',
  });

    const [authMode, setAuthMode] = useState<'options' | 'email_login' | 'email_register'>('options');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Modal açıldığında hata mesajını sıfırla
    useEffect(() => {
        if (isOpen) {
            setErrorMessage(null);
            setLoading(false);
            setAuthMode('options');
        }
    }, [isOpen]);

    // Google yanıtını dinleme (useAuthRequest)
    useEffect(() => {
        if (response?.type === 'success') {
            const idToken = response.authentication?.idToken || response.params?.id_token;
            const accessToken = response.authentication?.accessToken || response.params?.access_token;

            if (idToken || accessToken) {
                handleGoogleLogin(idToken, accessToken);
            }
        } else if (response?.type === 'error') {
            setErrorMessage('Google ile giriş sırasında bir sorun oluştu.');
            setLoading(false);
        }
    }, [response]);

    const handleGoogleLogin = async (idToken?: string | null, accessToken?: string | null) => {
        try {
            setLoading(true);
            setErrorMessage(null);
            await AuthService.loginWithGoogleIdToken(idToken, accessToken);
            HapticsService.success();
            if (onLoginSuccess) onLoginSuccess();
            onClose();
        } catch (error: any) {
            setErrorMessage(error.message || 'Giriş yapılamadı.');
            HapticsService.error();
        } finally {
            setLoading(false);
        }
    };

    // Doğrudan WebBrowser üzerinden Google Girişi
    const handleDirectGoogleLogin = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            HapticsService.medium();

            // Önce expo hook'unu dene
            if (promptAsync) {
                const res = await promptAsync();
                if (res?.type === 'success') {
                    const idToken = res.authentication?.idToken || res.params?.id_token;
                    const accessToken = res.authentication?.accessToken || res.params?.access_token;
                    if (idToken || accessToken) {
                        await handleGoogleLogin(idToken, accessToken);
                        return;
                    }
                }
            }
        } catch (error: any) {
            console.warn('Google Auth hatası:', error);
            setErrorMessage('Google ile giriş tamamlanamadı. E-posta ile giriş yapabilirsiniz.');
        } finally {
            setLoading(false);
        }
    };

    // E-posta ile Giriş
    const handleEmailLogin = async () => {
        if (!email.trim() || !password) {
            setErrorMessage('Lütfen e-posta ve şifrenizi girin.');
            return;
        }
        try {
            setLoading(true);
            setErrorMessage(null);
            HapticsService.medium();
            await AuthService.loginWithEmail(email, password);
            HapticsService.success();
            if (onLoginSuccess) onLoginSuccess();
            onClose();
        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setErrorMessage('E-posta veya şifre hatalı.');
            } else if (error.code === 'auth/invalid-email') {
                setErrorMessage('Geçersiz e-posta formatı.');
            } else {
                setErrorMessage(error.message || 'Giriş yapılamadı.');
            }
            HapticsService.error();
        } finally {
            setLoading(false);
        }
    };

    // E-posta ile Kayıt
    const handleEmailRegister = async () => {
        if (!email.trim() || !password) {
            setErrorMessage('Lütfen e-posta ve şifrenizi girin.');
            return;
        }
        if (password.length < 6) {
            setErrorMessage('Şifre en az 6 karakter olmalıdır.');
            return;
        }
        try {
            setLoading(true);
            setErrorMessage(null);
            HapticsService.medium();
            await AuthService.registerWithEmail(email, password);
            HapticsService.success();
            if (onLoginSuccess) onLoginSuccess();
            onClose();
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                setErrorMessage('Bu e-posta adresi zaten kayıtlı. Giriş yapabilirsiniz.');
            } else {
                setErrorMessage(error.message || 'Kayıt oluşturulamadı.');
            }
            HapticsService.error();
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        try {
            HapticsService.light();
            setLoading(true);
            setErrorMessage(null);
            await AuthService.loginAnonymously();
            HapticsService.success();
            if (onLoginSuccess) onLoginSuccess();
            onClose();
        } catch (error: any) {
            setErrorMessage('Misafir girişi başarısız oldu.');
            HapticsService.error();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="slide"
            onRequestClose={() => {
                if (canDismiss) onClose();
            }}
        >
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.modalContainer,
                        {
                            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                            borderColor: theme.cardBorder,
                        },
                    ]}
                >
                    {/* Kapatma Butonu */}
                    {canDismiss && (
                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: darkMode ? '#334155' : '#f1f5f9' }]}
                            onPress={() => {
                                HapticsService.light();
                                onClose();
                            }}
                        >
                            <X size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}

                    {/* Logo & Başlık */}
                    <View style={styles.header}>
                        <View style={[styles.iconCircle, { backgroundColor: Colors.accentGoldLight }]}>
                            <Sparkles size={32} color={Colors.accentGold} />
                        </View>
                        <Text style={[styles.title, { color: darkMode ? Colors.primaryAccent : Colors.primary }]}>
                            WordMem'e Hoş Geldiniz
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Kelimelerinizi bulutta yedekleyin ve tüm cihazlarınızdan senkronize öğrenin.
                        </Text>
                    </View>

                    {/* Hata Mesajı */}
                    {errorMessage && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    )}

                    {/* 1. SEÇENEKLER EKRANI */}
                    {authMode === 'options' && (
                        <>
                            {/* Özellikler Kartı */}
                            <View style={[styles.featuresCard, { backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }]}>
                                <View style={styles.featureItem}>
                                    <Cloud size={18} color={Colors.primaryPill} />
                                    <Text style={[styles.featureText, { color: theme.textPrimary }]}>
                                        Kelimelerinizi ve listelerinizi güvenle yedekleyin
                                    </Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Award size={18} color={Colors.accentOrange} />
                                    <Text style={[styles.featureText, { color: theme.textPrimary }]}>
                                        Oyun skorlarınızı ve başarı rozetlerinizi kaydedin
                                    </Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <BookOpen size={18} color={Colors.accentGold} />
                                    <Text style={[styles.featureText, { color: theme.textPrimary }]}>
                                        Kişisel öğrenme serinizi (streak) asla kaybetmeyin
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.actionContainer}>
                                {/* Google ile Giriş Butonu */}
                                <TouchableOpacity
                                    style={[styles.googleButton, { opacity: loading ? 0.7 : 1 }]}
                                    disabled={loading}
                                    onPress={handleDirectGoogleLogin}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#ffffff" />
                                    ) : (
                                        <View style={styles.btnContentRow}>
                                            <View style={styles.googleIconContainer}>
                                                <Text style={styles.googleG}>G</Text>
                                            </View>
                                            <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* E-posta ile Giriş / Kayıt Butonu */}
                                <TouchableOpacity
                                    style={[styles.emailButton, { backgroundColor: darkMode ? '#334155' : '#eef7f2', borderColor: Colors.primaryAccent }]}
                                    disabled={loading}
                                    onPress={() => {
                                        HapticsService.light();
                                        setErrorMessage(null);
                                        setAuthMode('email_login');
                                    }}
                                >
                                    <Text style={[styles.emailButtonText, { color: darkMode ? '#f8fafc' : Colors.primaryDark }]}>
                                        ✉️  E-posta ile Giriş / Kayıt
                                    </Text>
                                </TouchableOpacity>

                                {/* Misafir Olarak Devam Et */}
                                <TouchableOpacity
                                    style={[styles.guestButton, { backgroundColor: 'transparent' }]}
                                    disabled={loading}
                                    onPress={handleGuestLogin}
                                >
                                    <Text style={[styles.guestButtonText, { color: theme.textMuted }]}>
                                        Misafir Olarak Devam Et →
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* 2. E-POSTA İLE GİRİŞ EKRANI */}
                    {authMode === 'email_login' && (
                        <View style={styles.formContainer}>
                            <TextInput
                                style={[styles.input, { backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', color: theme.textPrimary, borderColor: theme.cardBorder }]}
                                placeholder="E-posta adresiniz"
                                placeholderTextColor={theme.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', color: theme.textPrimary, borderColor: theme.cardBorder }]}
                                placeholder="Şifreniz"
                                placeholderTextColor={theme.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                style={[styles.primarySubmitButton, { opacity: loading ? 0.7 : 1 }]}
                                disabled={loading}
                                onPress={handleEmailLogin}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.primarySubmitButtonText}>Giriş Yap</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.switchAuthRow}>
                                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Hesabınız yok mu?</Text>
                                <TouchableOpacity onPress={() => { setErrorMessage(null); setAuthMode('email_register'); }}>
                                    <Text style={{ color: Colors.primaryAccent, fontWeight: '700', fontSize: 13 }}> Hesap Oluştur</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.backOptionBtn}
                                onPress={() => { setErrorMessage(null); setAuthMode('options'); }}
                            >
                                <Text style={{ color: theme.textMuted, fontSize: 13 }}>← Diğer Giriş Seçenekleri</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 3. E-POSTA İLE KAYIT EKRANI */}
                    {authMode === 'email_register' && (
                        <View style={styles.formContainer}>
                            <TextInput
                                style={[styles.input, { backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', color: theme.textPrimary, borderColor: theme.cardBorder }]}
                                placeholder="E-posta adresiniz"
                                placeholderTextColor={theme.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', color: theme.textPrimary, borderColor: theme.cardBorder }]}
                                placeholder="Şifreniz (En az 6 karakter)"
                                placeholderTextColor={theme.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                style={[styles.primarySubmitButton, { opacity: loading ? 0.7 : 1, backgroundColor: Colors.accentOrange }]}
                                disabled={loading}
                                onPress={handleEmailRegister}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.primarySubmitButtonText}>Hesap Oluştur ve Başla</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.switchAuthRow}>
                                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Zaten hesabınız var mı?</Text>
                                <TouchableOpacity onPress={() => { setErrorMessage(null); setAuthMode('email_login'); }}>
                                    <Text style={{ color: Colors.primaryAccent, fontWeight: '700', fontSize: 13 }}> Giriş Yap</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.backOptionBtn}
                                onPress={() => { setErrorMessage(null); setAuthMode('options'); }}
                            >
                                <Text style={{ color: theme.textMuted, fontSize: 13 }}>← Diğer Giriş Seçenekleri</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Güvenlik Notu */}
                    <View style={styles.footerRow}>
                        <ShieldCheck size={14} color={theme.textMuted} />
                        <Text style={[styles.footerText, { color: theme.textMuted }]}>
                            Bilgileriniz Firebase ile güvenle korunmaktadır.
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 8,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 12,
    },
    featuresCard: {
        width: '100%',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureText: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    errorBox: {
        width: '100%',
        backgroundColor: '#ffe4e6',
        borderRadius: 10,
        padding: 10,
        marginBottom: 14,
    },
    errorText: {
        color: '#e11d48',
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '500',
    },
    actionContainer: {
        width: '100%',
        gap: 10,
        marginBottom: 16,
    },
    googleButton: {
        backgroundColor: '#345c43',
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#345c43',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    btnContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    googleIconContainer: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleG: {
        color: '#ea4335',
        fontWeight: '800',
        fontSize: 16,
    },
    googleButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    emailButton: {
        height: 48,
        borderRadius: 14,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emailButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    guestButton: {
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guestButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    formContainer: {
        width: '100%',
        gap: 12,
        marginBottom: 16,
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        fontSize: 14,
    },
    primarySubmitButton: {
        backgroundColor: '#345c43',
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    primarySubmitButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    switchAuthRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    backOptionBtn: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 12,
    },
});
