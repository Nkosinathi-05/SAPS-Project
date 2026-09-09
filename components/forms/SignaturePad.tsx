import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { View, StyleSheet } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";

type SignaturePadProps = {
  onSignature: (signature: string) => void;
};

export type SignaturePadHandle = {
  clear: () => void;
  capture: () => void;
};

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ onSignature }, ref) => {
    const signatureRef = useRef<any>(null);
    useImperativeHandle(ref, () => ({
      clear: () => {
        signatureRef.current?.clearSignature();
      },
        capture: () => {
          signatureRef.current?.readSignature();
        },
    }));

  return (
    <View style={styles.container}>
      <SignatureCanvas
        ref={signatureRef}
        onOK={(signature) => {
          onSignature(signature);
        }}
        onClear={() => {
          onSignature("");
        }}
        descriptionText="Sign here / Teken hier"
        clearText="Clear"
        confirmText="Save Signature"
        webStyle={`
          .m-signature-pad {
            box-shadow: none;
            border: none;
          }

          .m-signature-pad--body {
            border: 1px solid #cccccc;
          }

          .m-signature-pad--footer {
            margin: 10px;
          }
        `}
      />
    </View>
  );
}
);

const styles = StyleSheet.create({
  container: {
    height: 260,
    width: "100%",
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
});