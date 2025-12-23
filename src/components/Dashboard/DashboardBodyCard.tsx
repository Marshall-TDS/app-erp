import { Card, CardContent, Typography, type SxProps, type Theme, Stack, Box } from '@mui/material'

export type AccessMode = 'full' | 'read-only' | 'hidden' | {
    view?: boolean;
    visualizeItem?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    preview?: boolean;
    download?: boolean;
}

import {
    isHidden as checkIsHidden,
    canCreate as checkCanCreate,
    canEdit as checkCanEdit
} from '../../utils/accessControl'

type DashboardBodyCardProps = {
    title: string
    action?: React.ReactNode
    children: React.ReactNode
    sx?: SxProps<Theme>
    accessMode?: AccessMode
}

export const DashboardBodyCard = ({ title, action, children, sx, accessMode = 'full' }: DashboardBodyCardProps) => {
    const isHidden = checkIsHidden(accessMode)
    if (isHidden) return null

    const canInteract = checkCanCreate(accessMode) || checkCanEdit(accessMode)

    return (
        <Card variant="outlined" className="dashboard-card" sx={{ borderRadius: 2, ...sx }}>
            <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" className="dashboard-section-title">
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                    {canInteract && action && <Box>{action}</Box>}
                </Stack>
                {children}
            </CardContent>
        </Card>
    )
}
