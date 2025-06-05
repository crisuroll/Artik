import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, TouchableWithoutFeedback, Dimensions } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { AntDesign } from "@expo/vector-icons";

export default function Dropdown({ data, value, onChange, placeholder }) {
  const [expanded, setExpanded] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, direction: "down" });

  const openDropdown = useCallback(() => {
    buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
      const windowHeight = Dimensions.get('window').height;
      const dropdownHeight = Math.min(data.length * 48, 250);
      const spaceBelow = windowHeight - (pageY + height);
      const spaceAbove = pageY;

      let direction = "down";
      let top = pageY + height;
      let bottom = undefined;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        direction = "up";
        top = undefined;
        bottom = windowHeight - pageY;
      }

      setDropdownPosition({
        top,
        left: pageX,
        width: width,
        bottom,
        direction,
      });
      setExpanded(true);
    });
  }, [data.length]);

  const toggleExpanded = useCallback(() => {
    if (expanded) {
      setExpanded(false);
    } else {
      openDropdown();
    }
  }, [expanded, openDropdown]);

  const onSelect = useCallback((item) => {
    onChange(item.value);
    setExpanded(false);
  }, [onChange]);

  const selectedLabel = data.find((item) => item.value === value)?.label;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={buttonRef}
        style={styles.button}
        activeOpacity={0.8}
        onPress={toggleExpanded}
      >
        <Text style={styles.text}>{selectedLabel || placeholder}</Text>
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
                bottom: dropdownPosition.bottom,
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
    width: 350,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 16,
    outlineColor: '#70c0b7',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    paddingHorizontal: 15,
    width: '100%',
  },
  text: {
    fontSize: 16,
    color: "#333",
    opacity: 0.9,
    fontFamily: 'Nunito',
  },
  options: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
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
    fontFamily: 'Nunito',
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
});
