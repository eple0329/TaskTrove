"use client"

import React, { useState } from "react"
import { ChevronsUpDown, LogOut, Settings } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { useAtomValue, useSetAtom } from "jotai"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/custom/sidebar"
import { useTranslation } from "@tasktrove/i18n"
import { userAtom } from "@tasktrove/atoms/data/base/atoms"
import { openSettingsDialogAtom, openUserProfileDialogAtom } from "@tasktrove/atoms/ui/dialogs"
import { LogoutConfirmDialog } from "@/components/dialogs/logout-confirm-dialog"
import { THEME_COLORS } from "@tasktrove/constants"
import { UserAvatar } from "@/components/ui/custom/user-avatar"
import { RoleBadge } from "@/components/navigation/role-badge"

// No longer need NavUserProps - getting user from userAtom

export function NavUser() {
  // Translation setup
  const { t } = useTranslation("navigation")

  const { isMobile } = useSidebar()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const openSettingsDialog = useSetAtom(openSettingsDialogAtom)
  const openUserProfileDialog = useSetAtom(openUserProfileDialogAtom)

  // Get user data from atom
  const user = useAtomValue(userAtom)

  const handleSignOut = () => {
    setLogoutDialogOpen(true)
  }

  const handleConfirmLogout = async () => {
    await signOut({ redirect: false }) // disable redirect to avoid redirecting to wrong URL behind reverse proxy: https://github.com/nextauthjs/next-auth/issues/10928
    toast.success("Signed out")
    window.location.reload()
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserAvatar
                  username={user.username}
                  avatar={user.avatar}
                  size="sm"
                  showInitials={true}
                  className="ring-2 ring-background"
                />
                <div className="flex flex-1 items-center gap-1.5 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.username}</span>
                  <RoleBadge user={user} />
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div
                    className="flex items-center gap-2 flex-1 cursor-pointer hover:bg-accent rounded p-1 transition-colors"
                    onClick={openUserProfileDialog}
                    title="Edit Profile"
                  >
                    <UserAvatar
                      username={user.username}
                      avatar={user.avatar}
                      size="sm"
                      showInitials={true}
                      className="ring-2 ring-background"
                    />
                    <div className="grid text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.username}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={openSettingsDialog}
                      className="opacity-60 hover:opacity-100 transition-opacity rounded hover:bg-accent p-2"
                      title={t("userMenu.settings", "Settings")}
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="opacity-60 hover:opacity-100 transition-opacity rounded hover:bg-accent p-2"
                      title={t("userMenu.signOut", "Sign out")}
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleConfirmLogout}
      />
    </>
  )
}
