// google ile giriş ekranı
// src/components/modals/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
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
    const [request, response, promptAsync] = Google.useAuthRequest({
        // Buraya Firebase Console'dan aldığınız Web Client ID'yi yapıştırabilirsiniz
        webClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com',
    });

    // Google yanıtını dinleme
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            if (id_token) {
                handleGoogleLogin(id_token);
            }
        } else if (response?.type === 'error') {
            setErrorMessage('Google ile giriş sırasında bir sorun oluştu.');
            setLoading(false);
        }
    }, [response]);

    const handleGoogleLogin = async (idToken: string) => {
        try {
            setLoading(true);
            setErrorMessage(null);
            await AuthService.loginWithGoogleIdToken(idToken);
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
                    {/* Kapatma Butonu (Eğer kapatılabilirse) */}
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

                    {/* Hata Mesajı */}
                    {errorMessage && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    )}

                    {/* Butonlar */}
                    <View style={styles.actionContainer}>
                        {/* Google ile Giriş Butonu */}
                        <TouchableOpacity
                            style={[
                                styles.googleButton,
                                { opacity: loading ? 0.7 : 1 },
                            ]}
                            disabled={loading || !request}
                            onPress={() => {
                                HapticsService.medium();
                                promptAsync();
                            }}
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

                        {/* Misafir Olarak Devam Et */}
                        <TouchableOpacity
                            style={[
                                styles.guestButton,
                                { backgroundColor: darkMode ? '#334155' : '#e2eff2' },
                            ]}
                            disabled={loading}
                            onPress={handleGuestLogin}
                        >
                            <Text
                                style={[
                                    styles.guestButtonText,
                                    { color: darkMode ? '#f8fafc' : Colors.primaryDark },
                                ]}
                            >
                                Misafir Olarak Devam Et
                            </Text>
                        </TouchableOpacity>
                    </View>

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
    guestButton: {
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guestButtonText: {
        fontSize: 14,
        fontWeight: '600',
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
