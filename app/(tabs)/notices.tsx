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
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import TextArea from '../../components/TextArea';
import ActionButton from '../../components/ActionButton';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS } from '../../constants/theme';
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
    const { token, user } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const canPost = user?.role === 'COUNCILLOR' || user?.role === 'ADMIN';

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

    const handleCreateNotice = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/notices`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    content: newContent.trim(),
                }),
            });
            if (res.ok) {
                const created = await res.json();
                setNotices([created, ...notices]);
                setNewTitle('');
                setNewContent('');
                setShowForm(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

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
                    <Ionicons name="chevron-forward" size={20} color={COLORS.darkGray} />
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
                    <View>
                        <ScreenHeader
                            title="Ogłoszenia"
                            subtitle="Ważne komunikaty i informacje od rady osiedla"
                        />
                        {showForm && (
                            <View style={styles.newPostForm}>
                                <InputField
                                    placeholder="Tytuł ogłoszenia"
                                    icon="letters"
                                    value={newTitle}
                                    onChange={setNewTitle}
                                />
                                <TextArea
                                    placeholder="Treść ogłoszenia..."
                                    value={newContent}
                                    onChange={setNewContent}
                                />
                                <Button
                                    text={submitting ? "..." : "Opublikuj"}
                                    variant="primary"
                                    onClick={handleCreateNotice}
                                />
                            </View>
                        )}
                    </View>
                }
            />

            {canPost && (
                <View style={styles.fabContainer}>
                    <ActionButton
                        variant={showForm ? "danger" : "primary"}
                        onClick={() => setShowForm(!showForm)}
                    />
                </View>
            )}

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
        color: COLORS.darkGray,
    },
    cardTitle: {
        fontSize: 22,
        fontFamily: FONTS.heading,
        color: COLORS.black,
        marginBottom: 12,
        lineHeight: 28,
    },
    cardSnippet: {
        fontSize: 15,
        color: COLORS.darkGray,
        lineHeight: 22,
        marginBottom: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: COLORS.gray,
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
        color: COLORS.darkGray,
    },
    modalScroll: {
        flexGrow: 1,
    },
    detailsContent: {
        padding: 20,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 25,
        right: 25,
        zIndex: 1000,
    },
    newPostForm: {
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: 20,
        borderWidth: 2,
        borderColor: COLORS.gray,
        marginBottom: 24,
        gap: 12,
    },
});