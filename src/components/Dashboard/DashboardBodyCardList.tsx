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
    primaryClassName?: string
    secondaryClassName?: string
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
    addButtonLabel = 'Criar',
    onEdit,
    onDelete,
    emptyText = 'Nenhum item registrado.',
    primaryClassName = 'dashboard-text-primary',
    secondaryClassName = 'dashboard-text-secondary'
}: DashboardBodyCardListProps<T>) {
    return (
        <DashboardBodyCard
            title={title}
            action={onAdd && (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={onAdd}
                    sx={{
                        color: 'text.primary',
                        borderColor: 'divider',
                        '&:hover': {
                            borderColor: 'text.primary',
                            backgroundColor: 'action.hover',
                        },
                        minWidth: { xs: 36, md: 64 },
                        p: { xs: 0.5, md: '4px 10px' },
                        borderRadius: '10px',
                        textTransform: 'none'
                    }}
                >
                    <Add fontSize="small" sx={{ mr: { xs: 0, md: 1 } }} />
                    <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
                        {addButtonLabel === 'Criar' ? 'Criar' : addButtonLabel}
                    </Box>
                </Button>
            )}
        >
            <List dense disablePadding>
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
                            className="dashboard-list-item-border"
                        >
                            {onEdit ? (
                                <ListItemButton onClick={() => onEdit(item)}>
                                    {renderIcon && (
                                        <ListItemIcon>
                                            {renderIcon(item)}
                                        </ListItemIcon>
                                    )}
                                    <ListItemText
                                        primary={renderText(item)}
                                        secondary={renderSecondaryText && renderSecondaryText(item)}
                                        primaryTypographyProps={{ className: primaryClassName }}
                                        secondaryTypographyProps={{ className: secondaryClassName }}
                                    />
                                </ListItemButton>
                            ) : (
                                <Box sx={{ display: 'flex', width: '100%', p: 1 }}>
                                    {renderIcon && (
                                        <ListItemIcon>
                                            {renderIcon(item)}
                                        </ListItemIcon>
                                    )}
                                    <ListItemText
                                        primary={renderText(item)}
                                        secondary={renderSecondaryText && renderSecondaryText(item)}
                                        primaryTypographyProps={{ className: primaryClassName }}
                                        secondaryTypographyProps={{ className: secondaryClassName }}
                                    />
                                </Box>
                            )}
                        </ListItem>
                    ))
                ) : (
                    <Typography variant="body2" className="dashboard-empty-text">
                        {emptyText}
                    </Typography>
                )}
            </List>
        </DashboardBodyCard>
    )
}

