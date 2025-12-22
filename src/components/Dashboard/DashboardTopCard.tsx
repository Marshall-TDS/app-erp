import React from 'react'
import { Box, Stack, Typography } from '@mui/material'

type DashboardTopCardProps = {
    title: string
    children?: React.ReactNode
    action?: React.ReactNode
}

export const DashboardTopCard = ({ title, children, action }: DashboardTopCardProps) => {
    return (
        <Box className="dashboard-card" sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
                <Typography variant="h4" className="dashboard-title">
                    {title}
                </Typography>
                {action && <Box>{action}</Box>}
            </Stack>
            {children}
        </Box>
    )
}
