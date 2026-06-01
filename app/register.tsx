import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Text from '../components/AppText';
import ScreenHeader from '../components/ScreenHeader';
import InputField from '../components/InputField';
import Button from '../components/Button';
import SearchableSelect from '../components/SearchableSelect';
import { COLORS } from '../constants/theme';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        neighborhoodId: null as number | null,
    });

    const [error, setError] = useState<string | null>(null);

    const validate = () => {
        const { fullName, email, password, neighborhoodId } = formData;

        if (!fullName || !email || !password || !neighborhoodId) {
            return 'Wszystkie pola są wymagane.';
        }

        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length < 2) {
            return 'Imię i nazwisko muszą składać się z co najmniej dwóch słów.';
        }

        const isEachPartLongEnough = nameParts.every((part) => part.length >= 3);
        if (!isEachPartLongEnough) {
            return 'Zarówno imię, jak i nazwisko muszą mieć co najmniej 3 litery.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Wprowadź poprawny adres e-mail.';
        }

        if (password.length < 8) {
            return 'Hasło musi mieć co najmniej 8 znaków.';
        }

        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            return 'Hasło musi zawierać przynajmniej jedną wielką literę i jedną cyfrę.';
        }

        return null;
    };

    const handleRegister = async () => {
        const errorMessage = validate();

        if (errorMessage) {
            setError(errorMessage);
            return;
        }

        setError(null);

        const [firstName, lastName] = formData.fullName.trim().split(' ');
        const API_URL = process.env.EXPO_PUBLIC_API_URL;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email: formData.email,
                    password: formData.password,
                    neighborhoodId: formData.neighborhoodId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Wystąpił błąd podczas rejestracji.');
                return;
            } else {
                router.replace('/login');
            }
        } catch {
            setError('Nie można połączyć się z serwerem.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ScreenHeader title="Utwórz konto" />

                <View style={styles.form}>
                    <InputField
                        placeholder="Imię i nazwisko"
                        value={formData.fullName}
                        icon="person"
                        onChange={(val) => setFormData({ ...formData, fullName: val })}
                    />
                    <InputField
                        placeholder="Adres e-mail"
                        value={formData.email}
                        type="email"
                        icon="at"
                        onChange={(val) => setFormData({ ...formData, email: val })}
                    />
                    <InputField
                        placeholder="Hasło"
                        value={formData.password}
                        type="password"
                        icon="lock"
                        onChange={(val) => setFormData({ ...formData, password: val })}
                    />
                    <SearchableSelect
                        placeholder="Wybierz osiedle"
                        onChange={(val) => setFormData({ ...formData, neighborhoodId: val })}
                    />

                    <Button text="Zarejestruj się" onClick={handleRegister} />

                    {error && <Text style={styles.errorMsg}>{error}</Text>}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
    },
    form: {
        gap: 16,
    },
    errorMsg: {
        color: COLORS.danger,
        textAlign: 'center',
        marginTop: 10,
    },
    question: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
    },
    link: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});