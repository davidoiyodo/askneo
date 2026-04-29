import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/ThemeContext';
import { useAppContext } from '../../hooks/useAppContext';
import { Typography, Spacing, Radius } from '../../theme';
import { UserListing } from '../../hooks/useP2PListings';
import Icon from '../icons/Icon';

const CONDITIONS = [
  { key: 'like-new', label: 'Like new' },
  { key: 'good',     label: 'Good'     },
  { key: 'fair',     label: 'Fair'     },
] as const;

const MAX_IMAGES = 4;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (listing: UserListing) => void;
}

export default function ListItemModal({ visible, onClose, onSubmit }: Props) {
  const { theme } = useTheme();
  const { user } = useAppContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<UserListing['condition']>('good');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');

  const reset = () => {
    setName('');
    setDescription('');
    setCondition('good');
    setImages([]);
    setLocation('');
  };

  const handleClose = () => { reset(); onClose(); };

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Max images', `You can add up to ${MAX_IMAGES} photos.`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setImages(prev => [...prev, ...uris].slice(0, MAX_IMAGES));
    }
  };

  const takePhoto = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Max images', `You can add up to ${MAX_IMAGES} photos.`);
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const showImageOptions = () => {
    Alert.alert('Add photo', 'Choose a source', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Missing info', 'Please enter an item name.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Missing info', 'Please enter your pickup / delivery location.');
      return;
    }
    const listing: UserListing = {
      id: `my-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      condition,
      images,
      listedAt: new Date().toISOString(),
      ownerName: user?.name ?? 'Me',
      ownerLocation: location.trim(),
    };
    onSubmit(listing);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <View style={[styles.sheet, { backgroundColor: theme.bg.surface }]}>
          <View style={[styles.handle, { backgroundColor: theme.border.default }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.text.primary }]}>List an item</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7} style={styles.closeBtn}>
              <Icon name="close" size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sheetSub, { color: theme.text.secondary }]}>
            Items are free — delivery cost is calculated based on your location and the claimer's.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>

            {/* Photos */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>
                Photos <Text style={{ color: theme.text.tertiary }}>({images.length}/{MAX_IMAGES})</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
                {images.map((uri, i) => (
                  <View key={i} style={styles.imageThumbWrap}>
                    <Image source={{ uri }} style={styles.imageThumb} resizeMode="cover" />
                    <TouchableOpacity
                      onPress={() => removeImage(i)}
                      activeOpacity={0.8}
                      style={[styles.imageRemoveBtn, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
                    >
                      <Icon name="delete_2" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < MAX_IMAGES && (
                  <TouchableOpacity
                    onPress={showImageOptions}
                    activeOpacity={0.7}
                    style={[styles.addImageBtn, { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle }]}
                  >
                    <Icon name="pic_2" size={22} color={theme.text.tertiary} />
                    <Text style={[styles.addImageLabel, { color: theme.text.tertiary }]}>Add photo</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            {/* Item name */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Item name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Baby bouncer chair"
                placeholderTextColor={theme.text.tertiary}
                style={[styles.input, { backgroundColor: theme.bg.subtle, color: theme.text.primary, borderColor: theme.border.subtle }]}
              />
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Condition, age, why you're giving it away..."
                placeholderTextColor={theme.text.tertiary}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textarea, { backgroundColor: theme.bg.subtle, color: theme.text.primary, borderColor: theme.border.subtle }]}
              />
            </View>

            {/* Condition */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Condition</Text>
              <View style={styles.conditionRow}>
                {CONDITIONS.map(c => (
                  <TouchableOpacity
                    key={c.key}
                    onPress={() => setCondition(c.key)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: condition === c.key }}
                    accessibilityLabel={c.label}
                    style={[
                      styles.conditionChip,
                      condition === c.key
                        ? { backgroundColor: theme.interactive.primary }
                        : { backgroundColor: theme.bg.subtle, borderColor: theme.border.subtle },
                    ]}
                  >
                    <Text style={[
                      styles.conditionLabel,
                      { color: condition === c.key ? theme.interactive.primaryText : theme.text.secondary },
                    ]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Your location *</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Lekki, Lagos"
                placeholderTextColor={theme.text.tertiary}
                style={[styles.input, { backgroundColor: theme.bg.subtle, color: theme.text.primary, borderColor: theme.border.subtle }]}
              />
              <Text style={[styles.locationHint, { color: theme.text.tertiary }]}>
                Delivery fees are calculated when someone claims the item.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              style={[styles.submitBtn, { backgroundColor: theme.interactive.primary }]}
            >
              <Text style={styles.submitLabel}>List item</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingTop: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
    maxHeight: '92%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing[4],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[1],
  },
  sheetTitle: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.lg,
  },
  closeBtn: { padding: Spacing[1] },
  sheetSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.6,
    marginBottom: Spacing[5],
  },
  form: { gap: Spacing[4], paddingBottom: Spacing[4] },
  field: { gap: Spacing[2] },
  label: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  // ── Images ──────────────────────────────────────────────────────────────────
  imageRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingBottom: Spacing[1],
  },
  imageThumbWrap: {
    width: 88,
    height: 88,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn: {
    width: 88,
    height: 88,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  // ── Text inputs ──────────────────────────────────────────────────────────────
  input: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.base,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing[3],
  },
  conditionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  conditionChip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  conditionLabel: {
    fontFamily: Typography.fontFamily.bodySemibold,
    fontSize: Typography.size.sm,
  },
  locationHint: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: -Spacing[1],
  },
  submitBtn: {
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
  },
  submitLabel: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.size.base,
    color: '#fff',
  },
});
