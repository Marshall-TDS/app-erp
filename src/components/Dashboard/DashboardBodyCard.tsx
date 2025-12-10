import React from 'react'
import { Card, CardContent, Typography, type SxProps, type Theme } from '@mui/material'

type DashboardBodyCardProps = {
    title: string
    children: React.ReactNode
    sx?: SxProps<Theme>
}

export const DashboardBodyCard = ({ title, children, sx }: DashboardBodyCardProps) => {
    return (
        <Card variant="outlined" className="customer-dashboard-card" sx={{ borderRadius: 2, ...sx }}>
            <CardContent>
                <Typography variant="h6" className="customer-dashboard-section-title" gutterBottom>
                    {title}
                </Typography>
                {children}
            </CardContent>
        </Card>
    )
}

