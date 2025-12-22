import { DialogTitle, Stack, Typography, Button } from '@mui/material'
import { Close } from '@mui/icons-material'

type DashboardTopBarProps = {
    title: string
    onClose: () => void
}

export const DashboardTopBar = ({ title, onClose }: DashboardTopBarProps) => {
    return (
        <DialogTitle className="dashboard-header">
            <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h6" component="div">
                    {title}
                </Typography>
            </Stack>
            <Button autoFocus color="inherit" onClick={onClose} startIcon={<Close />}>
                Fechar
            </Button>
        </DialogTitle>
    )
}
