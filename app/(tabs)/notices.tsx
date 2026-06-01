import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/AppText';
import ScreenHeader from '../../components/ScreenHeader';
import ModalHero from '../../components/ModalHero';
import AuthorRow from '../../components/AuthorRow';
import Avatar from '../../components/Avatar';
import { COLORS } from '../../constants/theme';
import { sharedStyles } from '../../constants/sharedStyles';

interface Author {
    id: number;
    firstName: string;
    lastName: string;
    photo: string | null;
    role: 'USER' | 'COUNCILLOR' | 'ADMIN';
}

interface Notice {
    id: number;
    title: string;
    content: string;
    media: string | null;
    createdAt: string;
    author: Author;
}

export default function NoticesScreen() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const fetchNotices = async () => {
        try {
            const res = await fetch(`${API_URL}/notices`);
            const data = await res.json();
            setNotices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

        if (diff < 60) return 'przed chwilą';
        if (diff < 3600) return `${Math.floor(diff / 60)} min temu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`;
        if (diff < 172800) return 'wczoraj';

        return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getRoleName = (role: 'USER' | 'COUNCILLOR' | 'ADMIN') => {
        if (role === 'ADMIN') return 'Administrator';
        if (role === 'COUNCILLOR') return 'Radny';
        return 'Mieszkaniec';
    };

    const renderNoticeCard = ({ item }: { item: Notice }) => {
        return (
            <TouchableOpacity
                style={[sharedStyles.card, styles.cardPadding]}
                activeOpacity={0.9}
                onPress={() => setSelectedNotice(item)}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSnippet} numberOfLines={3}>{item.content}</Text>

                <View style={styles.cardFooter}>
                    <View style={styles.authorRow}>
                        <Avatar
                            photo={item.author?.photo}
                            firstName={item.author?.firstName}
                            lastName={item.author?.lastName}
                            size={40}
                        />
                        <Text style={styles.authorName}>
                            {item.author?.firstName} {item.author?.lastName}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={sharedStyles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={sharedStyles.screenContainer}>
            <FlatList
                data={notices}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNoticeCard}
                contentContainerStyle={sharedStyles.listContent}
                ListHeaderComponent={
                    <ScreenHeader
                        title="Ogłoszenia"
                        subtitle="Ważne komunikaty i informacje od rady osiedla"
                    />
                }
            />

            {selectedNotice && (
                <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedNotice(null)}>
                    <View style={sharedStyles.modalContainer}>
                        <TouchableOpacity style={sharedStyles.backButton} onPress={() => setSelectedNotice(null)}>
                            <Ionicons name="chevron-back" size={28} color="#000000" />
                        </TouchableOpacity>

                        <ScrollView contentContainerStyle={styles.modalScroll} bounces={false}>
                            <ModalHero
                                imageUri={selectedNotice.media || 'https://via.placeholder.com/800x450'}
                                title={selectedNotice.title}
                                subtitle={formatDate(selectedNotice.createdAt)}
                            />

                            <View style={styles.detailsContent}>
                                <View style={sharedStyles.section}>
                                    <Text style={sharedStyles.sectionHeader}>TREŚĆ OGŁOSZENIA</Text>
                                    <Text style={sharedStyles.descriptionBox}>{selectedNotice.content}</Text>
                                </View>

                                <View style={sharedStyles.section}>
                                    <Text style={sharedStyles.sectionHeader}>AUTOR WPISU</Text>
                                    <AuthorRow
                                        photo={selectedNotice.author?.photo}
                                        firstName={selectedNotice.author?.firstName}
                                        lastName={selectedNotice.author?.lastName}
                                        roleText={getRoleName(selectedNotice.author?.role)}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cardPadding: {
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 12,
    },
    date: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 12,
        lineHeight: 28,
    },
    cardSnippet: {
        fontSize: 15,
        color: '#7F8C8D',
        lineHeight: 22,
        marginBottom: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#ECF0F1',
        paddingTop: 16,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#7F8C8D',
    },
    modalScroll: {
        flexGrow: 1,
    },
    detailsContent: {
        padding: 20,
    },
});