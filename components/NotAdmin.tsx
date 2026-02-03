import { Shield, UserX } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { Badge } from "./ui/badge"
import { Role } from "@/types"

type NotAdminProps = {
    role: Role
}

const NotAdmin = ({ role }: NotAdminProps) => {

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-destructive/10 mx-auto mb-4">
                        <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-destructive" />
                    </div>
                    <CardTitle className="text-center text-xl sm:text-2xl">Access Denied</CardTitle>
                    <CardDescription className="text-center text-sm sm:text-base">
                        You need administrator privileges to access this page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <UserX className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            Current role: <Badge variant="outline" className="ml-2">{role || 'unknown'}</Badge>
                        </AlertDescription>
                    </Alert>
                    <div className="text-center text-xs sm:text-sm text-muted-foreground">
                        Please contact your system administrator if you believe this is an error.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default NotAdmin