"use client";

import React, { useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Link from "next/link";
import styled from "styled-components";
import Button from "@mui/material/Button";
import LightDarkSlider from "@/components/NavigationBar/LightDarkSlider";
import SignOutButton from "@/components/NavigationBar/SignOutButton";
import NavBarButton from "@/components/Buttons/NavBarButton";
import { usePathname } from "next/navigation";
import { RoleUpdateContext, roleCanAccessPage } from "@/app/roles";
import Modal from "@/components/Modal/Modal";
import LogoutIcon from "@mui/icons-material/Logout";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DatabaseAutoType } from "@/databaseUtils";

export const NavBarHeight = "3.5rem";

const MENU_BREAKPOINT = "1024px";

const StyledSwipeableDrawer = styled(SwipeableDrawer)`
    & .MuiPaper-root {
        background-image: none;
    }
`;

const UnstyledLink = styled(Link)`
    text-decoration: none;
    display: contents;
`;

const Logo = styled.img`
    max-width: 100%;
    max-height: 100%;
`;

const AppBarInner = styled.div`
    display: flex;
    height: ${NavBarHeight};
    padding: 0.5rem;
`;

const DrawerInner = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: stretch;
    padding: 1rem;
    width: 15rem;
`;

const DrawerButtonWrapper = styled.div`
    padding: 0.7rem;
    border-bottom: 1px solid ${(props) => props.theme.main.foreground[3]};

    &:last-child {
        border-bottom: none;
    }
`;

const DrawerButton = styled(Button)`
    text-transform: uppercase;
    width: 100%;
`;

const NavElementContainer = styled.div`
    display: flex;
    flex-basis: 0;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    margin: 0 1em;
`;

const MobileNavMenuContainer = styled(NavElementContainer)`
    justify-content: start;
    @media (min-width: ${MENU_BREAKPOINT}) {
        display: none;
    }
`;

const LogoElementContainer = styled(NavElementContainer)`
    justify-content: center;
    height: 100%;
    object-fit: cover;
    @media (min-width: ${MENU_BREAKPOINT}) {
        justify-content: start;
    }
`;

const DesktopButtonContainer = styled(NavElementContainer)`
    display: none;
    @media (min-width: ${MENU_BREAKPOINT}) {
        display: flex;
        gap: 1rem;
    }
`;

const SignOutButtonContainer = styled(NavElementContainer)`
    justify-content: end;
    gap: 1rem;
`;

const CenteredDiv = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin: 2rem 4rem 1rem 4rem;
`;

const LoginDependent: React.FC<Props> = (props) => {
    const pathname = usePathname();
    if (pathname === "/login" || pathname === "/forgot-password") {
        return <></>;
    }
    return <>{props.children}</>;
};

interface Props {
    children?: React.ReactNode;
}

interface RoleProps {
    children?: React.ReactNode;
    pathname: string;
}

const RoleDependent: React.FC<RoleProps> = ({ children, pathname }) => {
    const { role } = useContext(RoleUpdateContext);

    return <>{roleCanAccessPage(role, pathname) && children}</>;
};

const PAGES = [
    ["Parcels", "/parcels"],
    ["Clients", "/clients"],
    ["Batch Creation", "/batch-create"],
    ["Lists", "/lists"],
    ["Calendar", "/calendar"],
    ["Info", "/info"],
    ["Admin", "/admin"],
    ["Reports", "/reports"],
];

const NavigationBar: React.FC<Props> = ({ children }) => {
    const [drawer, setDrawer] = useState(false);
    const [islogOutModalOpen, setIslogOutModalOpen] = useState(false);
    const supabase = createClientComponentClient<DatabaseAutoType>();

    const openDrawer = (): void => {
        setDrawer(true);
    };

    const closeDrawer = (): void => {
        setDrawer(false);
    };

    const handleLogOutClick = (): void => {
        setIslogOutModalOpen(true);
    };

    const handleLogOutConfirm = async (): Promise<void> => {
        setIslogOutModalOpen(false);
        await supabase.auth.signOut();
    };

    return (
        <>
            <LoginDependent>
                <StyledSwipeableDrawer open={drawer} onClose={closeDrawer} onOpen={openDrawer}>
                    <DrawerInner>
                        {PAGES.map(([page, link]) => (
                            <RoleDependent key={page} pathname={link}>
                                <DrawerButtonWrapper>
                                    <UnstyledLink
                                        href={link}
                                        onClick={closeDrawer}
                                        prefetch={false}
                                    >
                                        <DrawerButton variant="text">{page}</DrawerButton>
                                    </UnstyledLink>
                                </DrawerButtonWrapper>
                            </RoleDependent>
                        ))}
                    </DrawerInner>
                </StyledSwipeableDrawer>
            </LoginDependent>
            <AppBar>
                <AppBarInner>
                    <MobileNavMenuContainer>
                        <Button
                            color="secondary"
                            aria-label="Mobile Menu Button"
                            onClick={openDrawer}
                        >
                            <MenuIcon />
                        </Button>
                    </MobileNavMenuContainer>
                    <LogoElementContainer>
                        <UnstyledLink href="/" prefetch={false}>
                            <Logo alt="Lambeth Foodbank Logo" src="/logo.webp" />
                        </UnstyledLink>
                    </LogoElementContainer>
                    <DesktopButtonContainer>
                        {PAGES.map(([page, link]) => (
                            <RoleDependent key={page} pathname={link}>
                                <NavBarButton link={link} page={page} />
                            </RoleDependent>
                        ))}
                    </DesktopButtonContainer>
                    <SignOutButtonContainer>
                        <LightDarkSlider />
                        <LoginDependent>
                            <SignOutButton onClick={handleLogOutClick} />
                        </LoginDependent>
                    </SignOutButtonContainer>
                </AppBarInner>
            </AppBar>
            {islogOutModalOpen && (
                <Modal
                    header={
                        <>
                            <LogoutIcon />
                            Would you like to log out?
                        </>
                    }
                    isOpen={islogOutModalOpen}
                    onClose={() => {
                        setIslogOutModalOpen(false);
                    }}
                    headerId="expandedParcelDetailsModal"
                    maxWidth="xs"
                >
                    <CenteredDiv>
                        <Button
                            color="error"
                            aria-label="Confirm Sign Out Button"
                            onClick={handleLogOutConfirm}
                            variant="contained"
                        >
                            Log Out
                        </Button>
                        <Button
                            aria-label="Cancel Sign Out"
                            onClick={() => {
                                setIslogOutModalOpen(false);
                            }}
                            variant="outlined"
                        >
                            Cancel
                        </Button>
                    </CenteredDiv>
                </Modal>
            )}
            {children}
        </>
    );
};

export default NavigationBar;
