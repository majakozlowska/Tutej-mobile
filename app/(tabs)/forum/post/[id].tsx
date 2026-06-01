import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../context/AuthContext';
import { COLORS, FONTS } from '../../../../constants/theme';

interface Author {
    id: number;
    firstName: string;
    lastName: string;
    photo: string | null;
}

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    author: Author;
}

interface PostDetail {
    id: number;
    title: string;
    content: string;
    media: string | null;
    createdAt: string;
    author: Author;
    forum: { id: number; name: string; icon: string | null };
    comments: Comment[];
}

export default function PostDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token, loadingAuth } = useAuth();
    const [post, setPost] = useState<PostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.37:5000/api';

    const fetchPostDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/forums/posts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPost(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loadingAuth && token && id) {
            fetchPostDetails();
        }
    }, [id, token, loadingAuth]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/forums/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newComment.trim() })
            });

            if (response.ok) {
                setNewComment('');
                fetchPostDetails();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.black} />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={styles.center}>
                <Text style={styles.notFound}>Wątek nie znaleziony</Text>
            </View>
        );
    }

    const renderPostHeader = () => (
        <View style={styles.postCard}>
            <View style={styles.postAuthorRow}>
                <View style={styles.onlyAuthor}>
                    <View style={styles.avatar}>
                        {post.author?.photo ? (
                            <Image source={{ uri: post.author.photo }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                            </Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.authorName}>{post.author?.firstName} {post.author?.lastName}</Text>
                        <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>
            {post.media && (
                <Image source={{ uri: post.media }} style={styles.postMedia} resizeMode="cover" />
            )}
            <View style={styles.commentsTitleRow}>
                <Text style={styles.commentsTitle}>Komentarze</Text>
                <View style={styles.commentsBadge}>
                    <Text style={styles.commentsBadgeText}>{post.comments?.length || 0}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.page}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.breadcrumb} numberOfLines={1}>{post.title}</Text>
            </View>

            <FlatList
                data={post.comments || []}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderPostHeader}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.noComments}>
                        <Text style={styles.noCommentsIcon}>💭</Text>
                        <Text style={styles.noCommentsText}>Brak komentarzy. Dodaj pierwszy!</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.comment}>
                        <View style={styles.commentAuthorOnly}>
                            <View style={styles.miniAvatar}>
                                {item.author?.photo ? (
                                    <Image source={{ uri: item.author.photo }} style={styles.avatarImage} />
                                ) : (
                                    <Text style={styles.miniAvatarText}>
                                        {item.author?.firstName?.[0]}{item.author?.lastName?.[0]}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.commentBody}>
                                <View style={styles.commentHeader}>
                                    <Text style={styles.commentAuthor}>{item.author?.firstName} {item.author?.lastName}</Text>
                                    <Text style={styles.commentDate}>
                                        {new Date(item.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.commentContent}>{item.content}</Text>
                    </View>
                )}
            />

            <View style={styles.addComment}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Napisz komentarz..."
                    placeholderTextColor={COLORS.darkGray}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline={true}
                />
                <TouchableOpacity
                    style={[styles.sendBtn, !newComment.trim() && { opacity: 0.5 }]}
                    onPress={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color={COLORS.darkGray} />
                    ) : (
                        <Ionicons name="send" size={20} color={COLORS.darkGray} />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        marginBottom: 20,
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
    breadcrumb: {
        fontSize: 20,
        fontFamily: FONTS.heading,
        color: COLORS.black,
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    postCard: {
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.gray,
        borderRadius: 18,
        padding: 24,
        marginBottom: 24,
    },
    postAuthorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    onlyAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: 'rgba(0,0,0,0.04)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    authorName: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.black,
    },
    postDate: {
        fontSize: 15,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    postTitle: {
        fontSize: 28,
        fontFamily: FONTS.heading,
        color: COLORS.black,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    postContent: {
        fontSize: 19,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
        lineHeight: 28,
    },
    postMedia: {
        width: '100%',
        height: 260,
        borderRadius: 18,
        marginTop: 20,
    },
    commentsTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 30,
    },
    commentsTitle: {
        fontSize: 18,
        fontFamily: FONTS.heading,
        color: COLORS.darkGray,
    },
    commentsBadge: {
        backgroundColor: COLORS.gray,
        paddingHorizontal: 11,
        paddingVertical: 2,
        borderRadius: 12,
    },
    commentsBadgeText: {
        fontSize: 16,
        fontFamily: FONTS.heading,
        color: COLORS.darkGray,
        marginBottom: 3,
    },
    noComments: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: 'rgba(0,0,0,0.01)',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'dashed',
    },
    noCommentsIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    noCommentsText: {
        fontSize: 18,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
        textAlign: 'center',
    },
    comment: {
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.03)',
        borderRadius: 18,
        padding: 20,
        marginBottom: 16,
    },
    commentAuthorOnly: {
        flexDirection: 'row',
        gap: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    miniAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.04)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    miniAvatarText: {
        fontSize: 13,
        fontFamily: FONTS.heading,
        color: COLORS.darkGray,
        marginBottom: 3,
    },
    commentBody: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    commentAuthor: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.black,
    },
    commentDate: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
        marginTop: 1,
    },
    commentContent: {
        fontSize: 18,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
        lineHeight: 26,
    },
    addComment: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.05)',
        padding: 12,
        borderRadius: 18,
        alignItems: 'center',
        marginHorizontal: 24,
        marginTop: 10,
        marginBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    commentInput: {
        flex: 1,
        fontSize: 18,
        fontFamily: FONTS.regular,
        color: COLORS.black,
        paddingHorizontal: 8,
        maxHeight: 80,
    },
    sendBtn: {
        width: 50,
        height: 50,
        borderRadius: 18,
        backgroundColor: COLORS.gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notFound: {
        fontSize: 20,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
    },
});