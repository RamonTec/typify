import { useMemo } from "react";
import { AlertTriangle, KeyRound } from "lucide-react";
import { ToolPanel, ToolWorkspace } from "../../components/templates/ToolWorkspace";
import { CodeEditor } from "../../components/organisms/CodeEditor";
import { InputActions } from "../../components/molecules/InputActions";
import { EditorEmptyOverlay } from "../../components/molecules/EditorEmptyOverlay";
import { EmptyState } from "../../components/molecules/EmptyState";
import { JwtInfo } from "../../components/molecules/JwtInfo";
import { Badge } from "../../components/atoms/Badge";
import { useHistory } from "../../hooks/useHistory";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { decodeJwtPayload } from "../../services/jwtDecoder";

export const JwtTool = () => {
    const { value: token, setValue: setToken, undo, redo, canUndo, canRedo } = useHistory<string>("");
    const debouncedToken = useDebouncedValue(token);

    const decoded = useMemo(
        () => (debouncedToken.trim() ? decodeJwtPayload(debouncedToken) : null),
        [debouncedToken]
    );
    const hasToken = token.length > 0;

    return (
        <ToolWorkspace
            input={
                <ToolPanel
                    title="Token"
                    variant="input"
                    controls={
                        decoded && token.trim() ? (
                            decoded.valid ? (
                                <Badge variant="success">
                                    {decoded.header && typeof decoded.header.alg === "string" ? decoded.header.alg : "JWT"}
                                </Badge>
                            ) : (
                                <Badge variant="error">Inválido</Badge>
                            )
                        ) : undefined
                    }
                    actions={
                        <InputActions
                            onUndo={hasToken ? undo : undefined}
                            onRedo={hasToken ? redo : undefined}
                            canUndo={canUndo}
                            canRedo={canRedo}
                            onClear={hasToken ? () => setToken("") : undefined}
                        />
                    }
                >
                    <CodeEditor
                        language="plaintext"
                        value={token}
                        onChange={(value) => setToken(value ?? "")}
                        className="border-0"
                    />
                    {!hasToken && (
                        <EditorEmptyOverlay
                            icon={KeyRound}
                            title="Pega tu JWT aquí"
                            description="Copia tu JWT (header.payload.signature) para decodificar su cabecera y su payload."
                            onPaste={setToken}
                        />
                    )}
                </ToolPanel>
            }
            output={
                <ToolPanel title="Token decodificado" variant="output">
                    {decoded?.valid ? (
                        <>
                            <JwtInfo result={decoded} showClaims={false} />
                            <div className="relative min-h-0 flex-1">
                                <CodeEditor language="json" value={decoded.payload} readOnly className="border-0 bg-slate-50" />
                            </div>
                        </>
                    ) : decoded ? (
                        <div className="h-full w-full bg-slate-50/50">
                            <EmptyState
                                icon={AlertTriangle}
                                title="No se pudo decodificar el token"
                                description={decoded.error}
                            />
                        </div>
                    ) : (
                        <div className="h-full w-full bg-slate-50/50">
                            <EmptyState
                                icon={KeyRound}
                                title="Esperando token..."
                                description="La cabecera, los claims de tiempo y el payload decodificado aparecerán aquí automáticamente."
                                className="opacity-60"
                            />
                        </div>
                    )}
                </ToolPanel>
            }
        />
    );
};
