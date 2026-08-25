// src/components/modals/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Cloud, Award, BookOpen, ShieldCheck, Sparkles, X, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { AuthService } from '../../services/authService';
import { HapticsService } from '../../utils/haptics';
import { Colors, getTheme } from '../../theme/colors';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void;
    darkMode?: boolean;
    canDismiss?: boolean;
}

const { width } = Dimensions.get('window');

const GOOGLE_WEB_CLIENT_ID = '612159107867-8vm5n6foo16d6mjchvppmeqdqkk0j6c6.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '612159107867-iq4g4akh8e3kmd8uuakh6tsj0a0srdan.apps.googleusercontent.com';

const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

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
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [authMode, setAuthMode] = useState<'options' | 'email_login' | 'email_register' | 'forgot_password'>('options');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Modal açıldığında form durumunu sıfırla
    useEffect(() => {
        if (isOpen) {
            setErrorMessage(null);
            setSuccessMessage(null);
            setLoading(false);
            setAuthMode('options');
        }
    }, [isOpen]);

    const handleGoogleLogin = async (idToken?: string | null, accessToken?: string | null) => {
        try {
            setLoading(true);
            setErrorMessage(null);
            await AuthService.loginWithGoogleIdToken(idToken, accessToken);
            HapticsService.success();
            if (onLoginSuccess) onLoginSuccess();
            onClose();
        } catch (error: any) {
            console.error('Google Giriş Hatası:', error);
            setErrorMessage(AuthService.getErrorMessage(error));
            HapticsService.error();
        } finally {
            setLoading(false);
        }
    };

    // Google ile Giriş Başlatma
    const handleDirectGoogleLogin = async () => {
        try {
            setLoading(true);
            setErrorMessage(null);
            setSuccessMessage(null);
            HapticsService.medium();

            // 1. Web ortamı
            if (Platform.OS === 'web') {
                await AuthService.loginWithGoogleWeb();
                HapticsService.success();
                if (onLoginSuccess) onLoginSuccess();
                onClose();
                return;
            }

            // 2. Standalone APK / Production Build (Play Services Native)
            if (!isExpoGo) {
                try {
                    const user = await AuthService.loginWithNativeGoogle();
                    if (user) {
                        HapticsService.success();
                        if (onLoginSuccess) onLoginSuccess();
                        onClose();
                        return;
                    }
                } catch (nativeErr: any) {
                    console.warn('Native Google giriş denemesi:', nativeErr);
                }
            }

            // 3. Expo Go Ortamı (WebBrowser ile OAuth)
            const redirectUri = AuthSession.makeRedirectUri({ scheme: 'wordmem', path: 'auth' });
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_WEB_CLIENT_ID}&response_type=token%20id_token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(redirectUri)}&nonce=${Date.now()}`;
            
            const authResult = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
            if (authResult.type === 'success' && authResult.url) {
                const params: Record<string, string> = {};
                const hashOrQuery = authResult.url.includes('#') ? authResult.url.split('#')[1] : (authResult.url.includes('?') ? authResult.url.split('?')[1] : '');
                hashOrQuery.split('&').forEach((pair) => {
                    const [k, v] = pair.split('=');
                    if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v);
                });
                const idToken = params.id_token;
                const accessToken = params.access_token;
                if (idToken || accessToken) {
                    await handleGoogleLogin(idToken, accessToken);
                    return;
                }
            } else if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
                setLoading(false);
                return;
            } else {
                setErrorMessage('Google girişi tamamlanamadı. E-posta ile giriş yapabilir veya misafir olarak devam edebilirsiniz.');
            }
        } catch (error: any) {
            console.warn('Google Auth Hatası:', error);
            setErrorMessage(AuthService.getErrorMessage(error));
            HapticsService.error();
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
            setErrorMessage(AuthService.getErrorMessage(error));
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
            setErrorMessage(AuthService.getErrorMessage(error));
            HapticsService.error();
        } finally {
            setLoading(false);
        }
    };

    // Şifre Sıfırlama
    const handleResetPassword = async () => {
        if (!email.trim()) {
            setErrorMessage('Lütfen şifre sıfırlama bağlantısı gönderilecek e-posta adresinizi girin.');
            return;
        }
        try {
            setLoading(true);
            setErrorMessage(null);
            HapticsService.medium();
            await AuthService.resetPassword(email);
            setSuccessMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.');
            HapticsService.success();
        } catch (error: any) {
            setErrorMessage(AuthService.getErrorMessage(error));
            HapticsService.error();
        } finally {
            setLoading(false);
        }
    };

    // Misafir Girişi (Anında açılır, arka planda opsiyonel Firebase oturumu dener)
    const handleGuestLogin = () => {
        try {
            HapticsService.light();
            if (onLoginSuccess) onLoginSuccess();
            onClose();
            // Arka planda Firebase anonim oturumu başlatmayı dene (UI'ı asla bloklamaz)
            AuthService.loginAnonymously().catch((anonErr) => {
                console.log('Firebase anonim oturum isteğe bağlı, yerel misafir modu aktif:', anonErr);
            });
        } catch (error: any) {
            console.error('Misafir girişi hatası:', error);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            visible={isOpen}
            transparent={false}
            animationType="fade"
            onRequestClose={() => {
                if (canDismiss) onClose();
            }}
        >
            <SafeAreaView style={[styles.safeAreaWrapper, { backgroundColor: darkMode ? '#0f172a' : '#ffffff' }]}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Top Bar Header */}
                    <View style={styles.topBar}>
                        {authMode !== 'options' ? (
                            <TouchableOpacity
                                style={[styles.backNavButton, { backgroundColor: darkMode ? '#1e293b' : '#f1f5f9' }]}
                                onPress={() => {
                                    HapticsService.light();
                                    setErrorMessage(null);
                                    setSuccessMessage(null);
                                    setAuthMode('options');
                                }}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <ArrowLeft size={20} color={theme.textPrimary} />
                            </TouchableOpacity>
                        ) : (
                            <View style={{ width: 38, height: 38 }} />
                        )}

                        {canDismiss && (
                            <TouchableOpacity
                                style={[styles.closeButton, { backgroundColor: darkMode ? '#1e293b' : '#f1f5f9' }]}
                                onPress={() => {
                                    HapticsService.light();
                                    onClose();
                                }}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <X size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.contentCard}>
                            {/* Logo & Başlık */}
                            <View style={styles.header}>
                                <View style={[styles.iconCircle, { backgroundColor: Colors.accentGoldLight }]}>
                                    <Sparkles size={34} color={Colors.accentGold} />
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

                            {/* Başarı Mesajı */}
                            {successMessage && (
                                <View style={styles.successBox}>
                                    <CheckCircle size={16} color="#16a34a" />
                                    <Text style={styles.successText}>{successMessage}</Text>
                                </View>
                            )}

                            {/* 1. SEÇENEKLER EKRANI */}
                            {authMode === 'options' && (
                                <>
                                    {/* Özellikler Kartı */}
                                    <View style={[styles.featuresCard, { backgroundColor: darkMode ? '#1e293b' : '#f8fafc', borderColor: theme.cardBorder }]}>
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
                                            activeOpacity={0.75}
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
                                            style={[styles.emailButton, { backgroundColor: darkMode ? '#1e293b' : '#f1f8f4', borderColor: Colors.primary }]}
                                            disabled={loading}
                                            activeOpacity={0.75}
                                            onPress={() => {
                                                HapticsService.light();
                                                setErrorMessage(null);
                                                setSuccessMessage(null);
                                                setAuthMode('email_login');
                                            }}
                                        >
                                            <Text style={[styles.emailButtonText, { color: darkMode ? '#f8fafc' : Colors.primary }]}>
                                                ✉️  E-posta ile Giriş / Kayıt
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Misafir Olarak Devam Et */}
                                        <TouchableOpacity
                                            style={styles.guestButton}
                                            disabled={loading}
                                            activeOpacity={0.7}
                                            onPress={handleGuestLogin}
                                        >
                                            <Text style={[styles.guestButtonText, { color: theme.textSecondary }]}>
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
                                        style={[styles.input, { backgroundColor: darkMode ? '#1e293b' : '#f8fafc', color: theme.textPrimary, borderColor: theme.cardBorder }]}
                                        placeholder="E-posta adresiniz"
                                        placeholderTextColor={theme.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                    <TextInput
                                        style={[styles.input, { backgroundColor: darkMode ? '#1e293b' : '#f8fafc', color: theme.textPrimary, borderColor: theme.cardBorder }]}
                                        placeholder="Şifreniz"
                                        placeholderTextColor={theme.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />

                                    <TouchableOpacity
                                        style={styles.forgotPasswordBtn}
                                        onPress={() => {
                                            setErrorMessage(null);
                                            setSuccessMessage(null);
                                            setAuthMode('forgot_password');
                                        }}
                                    >
                                        <Text style={[styles.forgotPasswordText, { color: Colors.primary }]}>Şifremi Unuttum</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.primarySubmitButton, { opacity: loading ? 0.7 : 1 }]}
                                        disabled={loading}
                                        activeOpacity={0.75}
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
                                        <TouchableOpacity onPress={() => { setErrorMessage(null); setSuccessMessage(null); setAuthMode('email_register'); }}>
                                            <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 13 }}> Hesap Oluştur</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.backOptionBtn}
                                        onPress={() => { setErrorMessage(null); setSuccessMessage(null); setAuthMode('options'); }}
                                    >
                                        <Text style={{ color: theme.textMuted, fontSize: 13 }}>← Diğer Giriş Seçenekleri</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* 3. E-POSTA İLE KAYIT EKRANI */}
                            {authMode === 'email_register' && (
                                <View style={styles.formContainer}>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: darkMode ? '#1e293b' : '#f8fafc', color: theme.textPrimary, borderColor: theme.cardBorder }]}
                                        placeholder="E-posta adresiniz"
                                        placeholderTextColor={theme.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                    <TextInput
                                        style={[styles.input, { backgroundColor: darkMode ? '#1e293b' : '#f8fafc', color: theme.textPrimary, borderColor: theme.cardBorder }]}
                                        placeholder="Şifreniz (En az 6 karakter)"
                                        placeholderTextColor={theme.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />

                                    <TouchableOpacity
                                        style={[styles.primarySubmitButton, { opacity: loading ? 0.7 : 1, backgroundColor: Colors.accentOrange }]}
                                        disabled={loading}
                                        activeOpacity={0.75}
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
                                        <TouchableOpacity onPress={() => { setErrorMessage(null); setSuccessMessage(null); setAuthMode('email_login'); }}>
                                            <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 13 }}> Giriş Yap</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.backOptionBtn}
                                        onPress={() => { setErrorMessage(null); setSuccessMessage(null); setAuthMode('options'); }}
                                    >
                                        <Text style={{ color: theme.textMuted, fontSize: 13 }}>← Diğer Giriş Seçenekleri</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* 4. ŞİFRE SIFIRLAMA EKRANI */}
                            {authMode === 'forgot_password' && (
                                <View style={styles.formContainer}>
                                    <Text style={[styles.formInfoText, { color: theme.textSecondary }]}>
                                        Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                                    </Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: darkMode ? '#1e293b' : '#f8fafc', color: theme.textPrimary, borderColor: theme.cardBorder }]}
                                        placeholder="E-posta adresiniz"
                                        placeholderTextColor={theme.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />

                                    <TouchableOpacity
                                        style={[styles.primarySubmitButton, { opacity: loading ? 0.7 : 1 }]}
                                        disabled={loading}
                                        activeOpacity={0.75}
                                        onPress={handleResetPassword}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#ffffff" />
                                        ) : (
                                            <Text style={styles.primarySubmitButtonText}>Sıfırlama Bağlantısı Gönder</Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.backOptionBtn}
                                        onPress={() => { setErrorMessage(null); setSuccessMessage(null); setAuthMode('email_login'); }}
                                    >
                                        <Text style={{ color: theme.textMuted, fontSize: 13 }}>← Giriş Ekranına Dön</Text>
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
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeAreaWrapper: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 6,
        minHeight: 48,
    },
    backNavButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 40,
    },
    contentCard: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 4,
    },
    iconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 16,
        fontWeight: '500',
    },
    featuresCard: {
        width: '100%',
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        marginBottom: 20,
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    errorBox: {
        width: '100%',
        backgroundColor: '#ffe4e6',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#e11d48',
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '600',
    },
    successBox: {
        width: '100%',
        backgroundColor: '#dcfce7',
        borderColor: '#bbf7d0',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    successText: {
        color: '#15803d',
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '600',
        flex: 1,
    },
    formInfoText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 8,
    },
    forgotPasswordBtn: {
        alignSelf: 'flex-end',
        paddingVertical: 4,
    },
    forgotPasswordText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionContainer: {
        width: '100%',
        gap: 12,
        marginBottom: 20,
    },
    googleButton: {
        backgroundColor: '#345c43',
        height: 52,
        borderRadius: 16,
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
        gap: 12,
    },
    googleIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleG: {
        color: '#ea4335',
        fontWeight: '900',
        fontSize: 16,
    },
    googleButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    emailButton: {
        height: 50,
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emailButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    guestButton: {
        height: 44,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    guestButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    formContainer: {
        width: '100%',
        gap: 14,
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    primarySubmitButton: {
        backgroundColor: '#345c43',
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },
    primarySubmitButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '800',
    },
    switchAuthRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },
    backOptionBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

