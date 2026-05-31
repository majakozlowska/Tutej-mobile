import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from './theme';

export const sharedStyles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    listContent: {
        padding: 20,
    },
    card: {
        borderWidth: 3,
        borderColor: '#ECF0F1',
        borderRadius: 20,
        backgroundColor: COLORS.white,
        marginBottom: 25,
        overflow: 'hidden',
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#7F8C8D',
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    descriptionBox: {
        fontSize: 15,
        color: '#2C3E50',
        lineHeight: 22,
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ECF0F1',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8F9F9',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    gridBox: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#ECF0F1',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
    },
    gridBoxLabel: {
        color: '#7F8C8D',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    gridBoxValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    }
});