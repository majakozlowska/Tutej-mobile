import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Modal,
    FlatList,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { Building, ChevronDown, Search, X } from 'lucide-react-native';
import Text from './AppText';
import { COLORS, FONTS } from '../constants/theme';

interface Neighborhood {
    id: number;
    name: string;
}

export default function SearchableSelect({ onChange }: { onChange: (id: number) => void }) {
    const [options, setOptions] = useState<Neighborhood[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedName, setSelectedName] = useState<string | null>(null);

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    useEffect(() => {
        fetch(`${API_URL}/neighborhoods`)
            .then((res) => res.json())
            .then((data) => {
                setOptions(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const filteredOptions = options.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (item: Neighborhood) => {
        setSelectedName(item.name);
        onChange(item.id);
        setModalVisible(false);
        setSearchQuery('');
    };

    return (
        <View>
            <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => setModalVisible(true)}
            >
                <Building size={24} color={COLORS.darkGray} />
                <Text style={[styles.triggerText, !selectedName && styles.placeholder]}>
                    {selectedName || 'Wybierz osiedle'}
                </Text>
                <ChevronDown size={20} color={COLORS.darkGray} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Wybierz osiedle</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X size={24} color={COLORS.black} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Search size={20} color={COLORS.darkGray} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Szukaj..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={filteredOptions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                                    <Text style={styles.optionText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={styles.noResults}>Nie znaleziono osiedla</Text>}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    selectTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.gray,
        backgroundColor: COLORS.white,
        gap: 12,
    },
    triggerText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
    },
    placeholder: {
        color: COLORS.darkGray,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        marginTop: 60,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONTS.heading,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: COLORS.gray,
        marginBottom: 20,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.darkGray,
        fontFamily: FONTS.regular,
    },
    option: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    optionText: {
        fontSize: 16,
    },
    noResults: {
        textAlign: 'center',
        marginTop: 20,
        color: COLORS.darkGray,
    },
});