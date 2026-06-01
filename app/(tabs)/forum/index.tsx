import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../components/AppText';
import { useAuth } from '../../../context/AuthContext';
import ScreenHeader from '../../../components/ScreenHeader';
import { COLORS, FONTS } from '../../../constants/theme';

interface Forum {
    id: number;
    name: string;
    description: string;
    icon: string | null;
    _count: { posts: number };
}

export default function ForumPage() {
    const { token, loadingAuth } = useAuth();
    const [forums, setForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.37:5000/api';

    useEffect(() => {
        if (loadingAuth || !token) {
            if (!loadingAuth) setLoading(false);
            return;
        }

        const fetchForums = async () => {
            try {
                const response = await fetch(`${API_URL}/forums`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setForums(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchForums();
    }, [token, loadingAuth]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.black} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.page}>
            <View style={styles.headerWrapper}>
                <ScreenHeader title="Forum" subtitle="Dyskutuj z sąsiadami o tym, co ważne" />
            </View>
            <View style={styles.grid}>
                {forums.length > 0 ? (
                    forums.map((forum) => (
                        <TouchableOpacity key={forum.id} style={styles.card} onPress={() => router.push(`/forum/${forum.id}`)}>
                            <View style={styles.mainContent}>
                                <View style={styles.iconContainer}>
                                    {forum.icon ? (
                                        <Text style={styles.emojiIcon}>{forum.icon}</Text>
                                    ) : (
                                        <Ionicons name="chatbubbles-outline" size={28} color={COLORS.black} />
                                    )}
                                </View>
                                <View style={styles.info}>
                                    <Text style={styles.forumName}>{forum.name}</Text>
                                    <Text style={styles.forumDesc}>{forum.description}</Text>
                                </View>
                            </View>
                            <View style={styles.footer}>
                                <Text style={styles.postLabel}>Wątki: {forum._count?.posts || 0}</Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.darkGray} />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.empty}>Brak dostępnych forów.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 24,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        gap: 20,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 18,
        padding: 24,
        borderWidth: 2,
        borderColor: COLORS.gray,
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: COLORS.gray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    emojiIcon: {
        fontSize: 28,
    },
    info: {
        flex: 1,
    },
    forumName: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        fontWeight: '700',
        color: COLORS.black,
    },
    forumDesc: {
        fontSize: 15,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
        marginTop: 6,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: COLORS.gray,
        alignItems: 'center',
    },
    postLabel: {
        fontSize: 15,
        color: COLORS.darkGray,
        fontFamily: FONTS.heading,
        fontWeight: '700',
    },
    empty: {
        textAlign: 'center',
        marginTop: 50,
        color: COLORS.darkGray,
        fontFamily: FONTS.regular,
        fontSize: 16,
    },
});