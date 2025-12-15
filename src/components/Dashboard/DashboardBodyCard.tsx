import { Card, CardContent, Typography, type SxProps, type Theme, Stack, Box } from '@mui/material'

type DashboardBodyCardProps = {
    title: string
    action?: React.ReactNode
    children: React.ReactNode
    sx?: SxProps<Theme>
}

export const DashboardBodyCard = ({ title, action, children, sx }: DashboardBodyCardProps) => {
    return (
        <Card variant="outlined" className="customer-dashboard-card" sx={{ borderRadius: 2, ...sx }}>
            <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1} className="customer-dashboard-section-title">
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                    {action && <Box>{action}</Box>}
                </Stack>
                {children}
            </CardContent>
        </Card>
    )
}

