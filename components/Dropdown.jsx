import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, TouchableWithoutFeedback } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { AntDesign } from "@expo/vector-icons";

export default function Dropdown({ data, onChange, placeholder }) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const openDropdown = useCallback(() => {
    buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
      setDropdownPosition({
        top: pageY + height,
        left: pageX,
        width: width,
      });
      setExpanded(true);
    });
  }, []);

  const toggleExpanded = useCallback(() => {
    if (expanded) {
      setExpanded(false);
    } else {
      openDropdown();
    }
  }, [expanded, openDropdown]);

  const onSelect = useCallback((item) => {
    onChange(item);
    setValue(item.label);
    setExpanded(false);
  }, [onChange]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={buttonRef}
        style={styles.button}
        activeOpacity={0.8}
        onPress={toggleExpanded}
      >
        <Text style={styles.text}>{value || placeholder}</Text>
        <AntDesign name={expanded ? "caretup" : "caretdown"} size={16} />
      </TouchableOpacity>

      <Modal visible={expanded} transparent>
        <TouchableWithoutFeedback onPress={() => setExpanded(false)}>
          <View style={styles.backdrop}>
            <View style={[
              styles.options,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }
            ]}>
              <FlatList
                keyExtractor={(item) => item.value}
                data={data}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.optionItem}
                    onPress={() => onSelect(item)}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },  
  button: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  text: {
    fontSize: 16,
    color: "#333",
    opacity: 0.9,
  },
  options: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  optionItem: {
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
});
