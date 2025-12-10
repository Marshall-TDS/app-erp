import React, { useState } from 'react'
import {
    Box,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    ClickAwayListener,
    Typography,
    Tooltip
} from '@mui/material'
import { Add, Close, Delete } from '@mui/icons-material'
import { DashboardBodyCard } from './DashboardBodyCard'

type DashboardBodyCardListProps<T> = {
    title: string
    items: T[]
    keyExtractor: (item: T) => string
    renderIcon?: (item: T) => React.ReactNode
    renderText: (item: T) => React.ReactNode
    renderSecondaryText?: (item: T) => React.ReactNode
    onAdd?: () => void
    addButtonLabel?: string
    onEdit?: (item: T) => void
    onDelete?: (item: T) => void
    emptyText?: string
}

const DeleteButton = ({ onDelete }: { onDelete: () => void }) => {
    const [confirming, setConfirming] = useState(false)

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirming) {
            onDelete()
        } else {
            setConfirming(true)
            // Reset confirmation after 3 seconds
            setTimeout(() => setConfirming(false), 3000)
        }
    }

    return (
        <ClickAwayListener onClickAway={() => setConfirming(false)}>
            <Tooltip title={confirming ? "Clique novamente para excluir" : "Excluir"}>
                <IconButton
                    edge="end"
                    onClick={handleClick}
                    color={confirming ? "error" : "default"}
                    sx={confirming ? { bgcolor: 'action.hover' } : {}}
                >
                    {confirming ? <Delete /> : <Close />}
                </IconButton>
            </Tooltip>
        </ClickAwayListener>
    )
}

export function DashboardBodyCardList<T>({
    title,
    items,
    keyExtractor,
    renderIcon,
    renderText,
    renderSecondaryText,
    onAdd,
    addButtonLabel = 'Adicionar',
    onEdit,
    onDelete,
    emptyText = 'Nenhum item registrado.'
}: DashboardBodyCardListProps<T>) {
    return (
        <DashboardBodyCard title={title}>
            <List dense>
                {items && items.length > 0 ? (
                    items.map((item) => (
                        <ListItem
                            key={keyExtractor(item)}
                            disablePadding
                            secondaryAction={
                                onDelete && (
                                    <DeleteButton onDelete={() => onDelete(item)} />
                                )
                            }
                            sx={{ borderBottom: '1px solid' }}
                            className="customer-dashboard-list-item-border"
                        >
                            {onEdit ? (
                                <ListItemButton onClick={() => onEdit(item)}>
                                    {renderIcon && (
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            {renderIcon(item)}
                                        </ListItemIcon>
                                    )}
                                    <ListItemText
                                        primary={renderText(item)}
                                        secondary={renderSecondaryText && renderSecondaryText(item)}
                                        primaryTypographyProps={{ className: 'customer-dashboard-text-primary' }}
                                        secondaryTypographyProps={{ className: 'customer-dashboard-text-secondary' }}
                                    />
                                </ListItemButton>
                            ) : (
                                <Box sx={{ display: 'flex', width: '100%', p: 1, pl: 2 }}>
                                    {renderIcon && (
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            {renderIcon(item)}
                                        </ListItemIcon>
                                    )}
                                    <ListItemText
                                        primary={renderText(item)}
                                        secondary={renderSecondaryText && renderSecondaryText(item)}
                                        primaryTypographyProps={{ className: 'customer-dashboard-text-primary' }}
                                        secondaryTypographyProps={{ className: 'customer-dashboard-text-secondary' }}
                                    />
                                </Box>
                            )}
                        </ListItem>
                    ))
                ) : (
                    <Typography variant="body2" className="customer-dashboard-empty-text">
                        {emptyText}
                    </Typography>
                )}
            </List>
            {onAdd && (
                <Box sx={{ mt: 2 }}>
                    <Button
                        fullWidth
                        variant="text"
                        sx={{
                            bgcolor: 'rgba(0, 0, 0, 0.15)',
                            color: 'var(--color-text)',
                            justifyContent: 'center',
                            textTransform: 'none',
                            fontWeight: 'medium',
                            '&:hover': {
                                bgcolor: 'action.selected'
                            }
                        }}
                        startIcon={<Add />}
                        onClick={onAdd}
                        disabled={!onAdd}
                    >
                        {addButtonLabel}
                    </Button>
                </Box>
            )}
        </DashboardBodyCard>
    )
}
