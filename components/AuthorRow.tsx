import React from 'react';
import {
    StyleSheet,
    View,
    Text
} from 'react-native';
import Avatar from './Avatar';

interface AuthorRowProps {
    photo: string | null | undefined;
    firstName: string;
    lastName: string;
    roleText?: string;
}
import { COLORS, FONTS } from '../constants/theme';

export default function AuthorRow({ photo, firstName, lastName, roleText }: AuthorRowProps) {
    return (
        <View style={styles.hostRow}>
            <Avatar photo={photo} firstName={firstName} lastName={lastName} size={44} />
            <View style={styles.authorInfo}>
                <Text style={styles.hostName}>{firstName} {lastName}</Text>
                {roleText && <Text style={styles.roleText}>{roleText}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    hostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
    },
    authorInfo: {
        marginLeft: 15,
        flexDirection: 'column',
    },
    hostName: {
        fontSize: 15,
        fontFamily: FONTS.bold,
        color: COLORS.black,
    },
    roleText: {
        fontSize: 13,
        fontFamily: FONTS.regular,
        color: COLORS.darkGray,
        marginTop: 2,
    },
});