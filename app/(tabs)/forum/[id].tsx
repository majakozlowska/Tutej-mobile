import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/Button';
import InputField from '../../../components/InputField';
import TextArea from '../../../components/TextArea';
import { COLORS, FONTS } from '../../../constants/theme';

interface Post {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    author: { firstName: string; lastName: string; photo: string | null };
}

export default function ForumPostsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token, loadingAuth } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.37:5000/api';

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${API_URL}/forums/${id}/posts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loadingAuth && token && id) {
            fetchPosts();
        } else if (!loadingAuth) {
            setLoading(false);
        }
    }, [id, token, loadingAuth]);

    const handleCreatePost = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/forums/${id}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    content: newContent.trim()
                })
            });

            if (response.ok) {
                setNewTitle('');
                setNewContent('');
                setShowForm(false);
                fetchPosts();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long'
        });
    };

    return (
        <View style={styles.page}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.breadcrumb}>Wątki</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                    <Ionicons name={showForm ? "close" : "add"} size={26} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            {showForm && (
                <View style={styles.newPostForm}>
                    <InputField
                        placeholder="Tytuł wątku"
                        icon="letters"
                        onChange={setNewTitle}
                    />
                    <TextArea
                        placeholder="Napisz coś..."
                        value={newContent}
                        onChange={setNewContent}
                    />
                    <View style={styles.formActions}>
                        <Button
                            text="Anuluj"
                            variant="secondary"
                            onClick={() => setShowForm(false)}
                        />
                        <Button
                            text={submitting ? "..." : "Opublikuj"}
                            variant="primary"
                            onClick={handleCreatePost}
                        />
                    </View>
                </View>
            )}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.black} />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>Brak postów w tym dziale.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.postCard} onPress={() => router.push(`/forum/post/${item.id}`)}>
                            <View style={styles.postMeta}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {item.author?.firstName?.[0]}{item.author?.lastName?.[0]}
                                    </Text>
                                </View>
                                <Text style={styles.authorName}>{item.author?.firstName} {item.author?.lastName}</Text>
                                <Text style={styles.dot}>•</Text>
                                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                            </View>
                            <Text style={styles.postTitle}>{item.title}</Text>
                            <Text style={styles.postSnippet} numberOfLines={2}>{item.content}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: 24,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 24,
        gap: 16,
    },
    backBtn: {
        width: 54,
        height: 54,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    addBtn: {
        width: 54,
        height: 54,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginLeft: 'auto',
    },
    breadcrumb: {
        fontSize: 22,
        fontFamily: FONTS.heading,
        color: COLORS.black,
    },
    listContainer: {
        paddingBottom: 40,
    },
    newPostForm: {
        backgroundColor: COLORS.white,
        borderRadius: 32,
        padding: 20,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.04)',
        marginBottom: 24,
        gap: 12,
    },
    label: {
        fontFamily: FONTS.heading,
        color: COLORS.darkGray,
        marginTop: 4,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        marginTop: 14,
    },
    postCard: {
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.gray,
        borderRadius: 28,
        padding: 24,
        marginBottom: 20,
    },
    postMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 12,
        fontFamily: FONTS.heading,
        color: COLORS.darkGray,
        marginBottom: 3,
    },
    authorName: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        fontWeight: '700',
        color: COLORS.black,
    },
    dot: {
        color: COLORS.darkGray,
    },
    date: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
    },
    postTitle: {
        fontSize: 23,
        fontFamily: FONTS.heading,
        color: COLORS.black,
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    postSnippet: {
        fontSize: 18,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
        lineHeight: 26,
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 19,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
    },
});