import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image
} from 'react-native';

interface AvatarProps {
    photo: string | null | undefined;
    firstName?: string;
    lastName?: string;
    size?: number;
}

export default function Avatar({ photo, firstName = '', lastName = '', size = 44 }: AvatarProps) {
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

    if (photo) {
        return (
            <Image
                source={{ uri: photo }}
                style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
            />
        );
    }

    return (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        resizeMode: 'cover',
    },
    fallback: {
        backgroundColor: '#ECF0F1',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    initials: {
        fontWeight: '700',
        color: '#7F8C8D',
    },
});