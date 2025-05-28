import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import UploadFile from '../components/UploadFile';
import BackButton from '../components/BackButton';
import { useEditCommission } from '../hooks/useShop';

function OptionListInput({ label, options, setOptions, placeholder }) {
  const [inputs, setInputs] = useState(['']);
  const safeOptions = Array.isArray(options) ? options : [];

  useEffect(() => {
    if (!safeOptions.includes("Otro")) {
      setOptions([...safeOptions, "Otro"]);
    }
  }, [safeOptions, setOptions]);

  const handleAddInput = () => {
    setInputs([...inputs, '']);
  };

  const handleConfirm = (idx) => {
    const value = inputs[idx].trim();
    if (value && !safeOptions.includes(value)) {
      setOptions([...safeOptions.filter(opt => opt !== "Otro"), value, "Otro"]);
    }
    setInputs(inputs.map((input, i) => (i === idx ? '' : input)));
  };

  const handleRemoveOption = (idx) => {
    const filtered = safeOptions.filter((_, i) => i !== idx && safeOptions[_] !== "Otro");
    setOptions([...filtered, "Otro"]);
  };

  const handleInputChange = (text, idx) => {
    setInputs(inputs.map((input, i) => (i === idx ? text : input)));
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      {/* Inputs para escribir nuevas opciones */}
      {inputs.map((input, idx) => (
        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={input}
            onChangeText={text => handleInputChange(text, idx)}
            placeholder={placeholder}
          />
          <TouchableOpacity onPress={() => handleConfirm(idx)} style={{ marginLeft: 8, backgroundColor: '#1abc9c', borderRadius: 8, padding: 8 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>✓</Text>
          </TouchableOpacity>
        </View>
      ))}
      {/* Opciones definitivas */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {safeOptions.map((opt, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, margin: 2 }}>
            <Text>{opt}</Text>
            {opt !== "Otro" && (
              <TouchableOpacity onPress={() => handleRemoveOption(idx)} style={{ marginLeft: 6 }}>
                <Text style={{ color: '#d00', fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function EditCommissionScreen() {
  const router = useRouter();
  const {
    title, setTitle,
    description, setDescription,
    imageUrl, setImageUrl,
    loading, uploading, setUploading,
    fetchCommission,
    handleSave,
    typeOptions, setTypeOptions,
    numCharactersOptions, setNumCharactersOptions,
    sizeOptions, setSizeOptions,
  } = useEditCommission();

  useEffect(() => {
    fetchCommission();
  }, [fetchCommission]);

  const onSave = useCallback(async () => {
    setUploading(true);
    await handleSave({
      title,
      description,
      imageUrl,
      type_options: typeOptions,
      num_characters_options: numCharactersOptions,
      size_options: sizeOptions,
    });
    setUploading(false);
    router.back();
  }, [title, description, imageUrl, typeOptions, numCharactersOptions, sizeOptions, handleSave, router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007b7f" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <BackButton />
      <Text style={styles.label}>Imagen</Text>
      <UploadFile
        imageUrl={imageUrl}
        onUploadSuccess={setImageUrl}
        setUploading={setUploading}
        bucketName="commissions"
        style={styles.imagePicker}
        editable
      />

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Título de la commission"
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe tu commission"
        multiline
      />

      <OptionListInput
        label="Opciones de tipo"
        options={typeOptions}
        setOptions={setTypeOptions}
        placeholder="Añadir tipo..."
      />
      <OptionListInput
        label="Opciones de nº personajes"
        options={numCharactersOptions}
        setOptions={setNumCharactersOptions}
        placeholder="Añadir nº personajes..."
      />
      <OptionListInput
        label="Opciones de tamaño"
        options={sizeOptions}
        setOptions={setSizeOptions}
        placeholder="Añadir tamaño..."
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={onSave}
        disabled={uploading}
      >
        <Text style={styles.saveButtonText}>
          {uploading ? 'Guardando...' : 'Guardar'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  imagePicker: {
    width: 180,
    height: 180,
    backgroundColor: '#eee',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  saveButton: {
    backgroundColor: '#007b7f',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});