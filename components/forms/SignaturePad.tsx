import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { View, StyleSheet, Platform } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";

type SignaturePadProps = {
  onSignature: (signature: string) => void;
};

export type SignaturePadHandle = {
  clear: () => void;
  capture: () => void;
};

const NativeSignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
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

const WebSignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ onSignature }, ref) => {
    const containerRef = useRef<any>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
      if (!containerRef.current) return;

      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 260;
      canvas.style.width = "100%";
      canvas.style.height = "260px";
      canvas.style.border = "1px solid #cccccc";
      canvas.style.borderRadius = "8px";
      canvas.style.touchAction = "none";

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000000";
      }

      const getPos = (e: any) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY;
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY,
        };
      };

      const start = (e: any) => {
        isDrawing.current = true;
        const pos = getPos(e);
        ctx?.beginPath();
        ctx?.moveTo(pos.x, pos.y);
      };

      const move = (e: any) => {
        if (!isDrawing.current) return;
        const pos = getPos(e);
        ctx?.lineTo(pos.x, pos.y);
        ctx?.stroke();
        setHasSignature(true);
      };

      const end = () => {
        isDrawing.current = false;
      };

      canvas.addEventListener("mousedown", start);
      canvas.addEventListener("mousemove", move);
      canvas.addEventListener("mouseup", end);
      canvas.addEventListener("mouseleave", end);

      containerRef.current.appendChild(canvas);
      canvasRef.current = canvas;

      return () => {
        containerRef.current?.removeChild(canvas);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setHasSignature(false);
        onSignature("");
      },
      capture: () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasSignature) {
          onSignature("");
          return;
        }
        const dataUrl = canvas.toDataURL("image/png");
        onSignature(dataUrl);
      },
    }));

    return <View ref={containerRef} style={styles.container} />;
  }
);

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ onSignature }, ref) => {
    if (Platform.OS === "web") {
      return <WebSignaturePad ref={ref} onSignature={onSignature} />;
    }
    return <NativeSignaturePad ref={ref} onSignature={onSignature} />;
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