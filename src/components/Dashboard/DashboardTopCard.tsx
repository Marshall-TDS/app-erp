import { Box, Stack, Typography } from '@mui/material'
import { type AccessMode } from './DashboardBodyCard'
import { isHidden as checkIsHidden, canEdit as checkCanEdit, canCreate as checkCanCreate } from '../../utils/accessControl'

type DashboardTopCardProps = {
    title: string
    children?: React.ReactNode
    action?: React.ReactNode
    accessMode?: AccessMode
}

export const DashboardTopCard = ({ title, children, action, accessMode = 'full' }: DashboardTopCardProps) => {
    if (checkIsHidden(accessMode)) return null

    const canInteract = checkCanEdit(accessMode) || checkCanCreate(accessMode)

    return (
        <Box className="dashboard-card" sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
                <Typography variant="h4" className="dashboard-title">
                    {title}
                </Typography>
                {canInteract && action && <Box>{action}</Box>}
            </Stack>
            {children}
        </Box>
    )
}
