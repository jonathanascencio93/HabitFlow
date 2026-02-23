import { auth } from '@/src/config/firebase';
import { FontAwesome5 } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Clear login error when user types
    useEffect(() => {
        if (loginError) setLoginError('');
    }, [email, password]);

    // Validations
    const isValidEmail = (e: string) => {
        if (e.length === 0) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    };

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLengthValid = password.length >= 6;
    const isPasswordValid = isLogin || (hasUpperCase && hasLowerCase && hasSymbol && isLengthValid);

    // Real-time validation flags
    const showEmailError = email.length > 0 && !isValidEmail(email);
    const showRulesError = !isLogin && password.length > 0 && !isPasswordValid;
    const showMatchError = !isLogin && confirmPassword.length > 0 && password !== confirmPassword;

    // Form completeness validation
    const isFormValid = isLogin
        ? (email.length > 0 && isValidEmail(email) && password.length > 0)
        : (firstName.trim().length > 0 && email.length > 0 && isValidEmail(email) && isPasswordValid && password === confirmPassword);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (!isLogin) {
            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match.');
                return;
            }
            if (!isPasswordValid) {
                Alert.alert('Error', 'Create a strong password with a mix of letters, numbers and symbols.');
                return;
            }
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: firstName.trim() });
                Alert.alert('Welcome, ' + firstName.trim() + '!', 'Your account has been created.');
            }
        } catch (error: any) {
            console.error('Authentication Error:', error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                setLoginError('Incorrect email or password.');
            } else {
                Alert.alert('Authentication Failed', error.message || 'An error occurred during authentication.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                {/* Logo & Welcome */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircleBg}>
                        <FontAwesome5 name="water" size={32} color="#FF6B6B" />
                    </View>
                </View>
                <Text style={styles.title}>HabitFlow</Text>
                <Text style={styles.subtitle}>
                    {isLogin ? 'Welcome back! Let\'s build momentum.' : 'Create an account to start your journey.'}
                </Text>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                    {/* First Name (signup only) */}
                    {!isLogin && (
                        <>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="What should we call you?"
                                value={firstName}
                                onChangeText={setFirstName}
                                autoCapitalize="words"
                                editable={!isLoading}
                            />
                        </>
                    )}

                    {/* Email */}
                    <Text style={[styles.label, { marginTop: !isLogin ? 12 : 0 }]}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, showEmailError && styles.inputError]}
                            placeholder="you@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!isLoading}
                        />
                        {showEmailError && (
                            <FontAwesome5 name="exclamation-circle" size={16} color="#FF5A5F" style={styles.errorIcon} />
                        )}
                    </View>
                    {showEmailError && (
                        <Text style={styles.errorTextBelow}>Please enter a valid email address.</Text>
                    )}

                    {/* Password */}
                    <Text style={[styles.label, { marginTop: showEmailError ? 4 : 16 }]}>Password</Text>
                    <View style={[styles.passwordInputContainer, (showRulesError || !!loginError) && styles.inputError]}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                        >
                            <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={20} color={showRulesError || loginError ? "#FF5A5F" : "#717171"} />
                        </TouchableOpacity>
                        {(showRulesError || !!loginError) && (
                            <FontAwesome5 name="exclamation-circle" size={16} color="#FF5A5F" style={styles.errorIconAbsolute} />
                        )}
                    </View>
                    {!isLogin ? (
                        <Text style={showRulesError ? styles.errorTextBelow : styles.helperTextBelow}>
                            Create a strong password with a mix of letters, numbers and symbols.
                        </Text>
                    ) : (
                        loginError ? <Text style={styles.errorTextBelow}>{loginError}</Text> : null
                    )}

                    {/* Confirm Password */}
                    {!isLogin && (
                        <>
                            <Text style={[styles.label, { marginTop: 4 }]}>Confirm Password</Text>
                            <View style={[styles.passwordInputContainer, showMatchError && styles.inputError]}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={isLoading}
                                >
                                    <FontAwesome5 name={showConfirmPassword ? "eye" : "eye-slash"} size={20} color={showMatchError ? "#FF5A5F" : "#717171"} />
                                </TouchableOpacity>
                                {showMatchError && (
                                    <FontAwesome5 name="exclamation-circle" size={16} color="#FF5A5F" style={styles.errorIconAbsolute} />
                                )}
                            </View>
                            {showMatchError && (
                                <Text style={styles.errorTextBelow}>Passwords do not match.</Text>
                            )}
                        </>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.button, (!isFormValid || isLoading || showRulesError || showMatchError || showEmailError) && styles.buttonDisabled]}
                    onPress={handleAuth}
                    disabled={!isFormValid || isLoading || showRulesError || showMatchError || showEmailError}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
                    )}
                </TouchableOpacity>

                {/* Toggle Mode */}
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setIsLogin(!isLogin)}
                    disabled={isLoading}
                >
                    <Text style={styles.toggleText}>
                        {isLogin ? 'New to HabitFlow? Sign Up' : 'Already have an account? Sign In'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5EE',
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircleBg: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: '#FFE4E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#222222',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: '#717171',
        textAlign: 'center',
        marginBottom: 48,
    },
    inputContainer: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222222',
        marginBottom: 8,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    input: {
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#EBEBEB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#222222',
        marginBottom: 4,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#EBEBEB',
        borderRadius: 12,
        marginBottom: 4,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#222222',
        borderRadius: 12,
    },
    eyeIcon: {
        padding: 16,
    },
    errorIcon: {
        position: 'absolute',
        right: 16,
    },
    errorIconAbsolute: {
        position: 'absolute',
        right: 50, // Shifted to make room for eye icon
    },
    inputError: {
        borderColor: '#FF5A5F',
        backgroundColor: '#FFF5F5',
    },
    errorTextBelow: {
        color: '#FF5A5F',
        fontSize: 10,
        marginBottom: 12,
    },
    helperTextBelow: {
        color: '#717171',
        fontSize: 11,
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#FF6B6B',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    toggleButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    toggleText: {
        color: '#FF6B6B',
        fontSize: 15,
        fontWeight: '600',
    },
});
