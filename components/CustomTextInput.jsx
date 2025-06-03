import { TextInput, StyleSheet } from 'react-native';

export default function CustomTextInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  multiline = false,
  style,
  ...rest
}) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.multiline, style]}
      placeholder={placeholder}
      placeholderTextColor="#666"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    width: 350,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
    outlineColor: '#70c0b7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});