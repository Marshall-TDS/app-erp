import { useState } from 'react'
import {
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material'
import { Close } from '@mui/icons-material'

type NamePickerProps = {
    label?: string
    value: string
    onChange: (value: string) => void
    fullWidth?: boolean
    required?: boolean
    disabled?: boolean
    error?: boolean
    helperText?: string
    placeholder?: string
}

const NamePicker = ({
    label,
    value,
    onChange,
    fullWidth = false,
    required = false,
    disabled = false,
    error = false,
    helperText,
    placeholder,
}: NamePickerProps) => {
    const [localError, setLocalError] = useState(false)
    const [localHelperText, setLocalHelperText] = useState('')

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = event.target.value

        // 1. Permitir digitar somente estes caracteres (Regex para letras e acentos e espaços)
        // Se o novo caractere não for válido, simplesmente ignoramos (mas o evento vem completo,
        // então removemos chars inválidos)
        // Regex: [a-zA-Z\u00C0-\u00FF\s] cobre a maioria dos acentos.
        // O pedido especifica: [A-Za-z] e [á, à, â, ã, é, ê, í, ó, ô, õ, ú, ü, ç]
        // Hex codes for those:
        // á: \u00E1, à: \u00E0, â: \u00E2, ã: \u00E3
        // é: \u00E9, ê: \u00EA
        // í: \u00ED
        // ó: \u00F3, ô: \u00F4, õ: \u00F5
        // ú: \u00FA, ü: \u00FC
        // ç: \u00E7
        // And uppercases...
        // simpler to use range \u00C0-\u00FF usually, but let's be strict if needed.
        // However, regex replacement on input change effectively prevents typing it.

        // Regex estrito para cobrir exatamente o solicitado e correções de usabilidade:
        // Letras A-Z (case insensitive), espaços
        // Faixa \u00C0-\u00FF cobre todas as vogais acentuadas (Á, À, Â, Ã, É, Ê, Í, Ó, Ô, Õ, Ú, Ü, Ç e suas variantes)
        // Incluindo acentos isolados (dead keys) e aspas pelo código unicode para garantir compatibilidade total:
        // \u00B4 (´), \u0060 (`), \u005E (^), \u007E (~), \u00A8 (¨)
        // \u0027 ('), \u0022 (")
        // Adicionando MODIFIER LETTER CIRCUMFLEX ACCENT (\u02C6) e SMALL TILDE (\u02DC) que são gerados por alguns teclados/OS
        const validCharsRegex = /^[a-zA-Z\u00C0-\u00FF\s\u00B4\u0060\u005E\u007E\u00A8\u0027\u0022\u02C6\u02DC]*$/

        if (!validCharsRegex.test(newValue)) {
            // ... (logica de tratamento)

            // Tentativa de remover chars inválidos mantendo apenas os permitidos
            const sanitizedData = newValue.replace(/[^a-zA-Z\u00C0-\u00FF\s\u00B4\u0060\u005E\u007E\u00A8\u0027\u0022\u02C6\u02DC]/g, '')

            if (sanitizedData !== newValue) {
                // Significa que tentou digitar algo invalido.
                // Se eu apenas substituir, satisfaço o requisito 1 (só entra valido).
                // O requisito 3 fica redundante, mas OK.
                setLocalError(true)
                setLocalHelperText('Caractere inválido detectado.')
                // Atualizo com o sanitizado? Ou deixo o usuário ver?
                // "Permitir digitar somente" -> geralmente bloqueia input.
                // Vou bloquear.
                newValue = sanitizedData
            } else {
                setLocalError(false)
                setLocalHelperText('')
            }
        } else {
            setLocalError(false)
            setLocalHelperText('')
        }

        onChange(newValue)
    }

    const handleBlur = () => {
        // Validação extra no blur se necessário
    }

    const handleClear = () => {
        onChange('')
        setLocalError(false)
        setLocalHelperText('')
    }

    const displayError = error || localError
    const displayHelperText = localError ? localHelperText : helperText

    return (
        <TextField
            label={label}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth={fullWidth}
            required={required}
            disabled={disabled}
            error={displayError}
            helperText={displayHelperText}
            placeholder={placeholder}
            InputProps={{
                endAdornment: value ? (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="limpar texto"
                            onClick={handleClear}
                            edge="end"
                            size="small"
                            disabled={disabled}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ) : undefined,
            }}
        />
    )
}

export default NamePicker
