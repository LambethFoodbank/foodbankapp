import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPen } from "@fortawesome/free-solid-svg-icons/faUserPen";
import { faKey } from "@fortawesome/free-solid-svg-icons/faKey";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { EditSubheading, ManageMode } from "@/app/admin/manageUser/ManageUserModal";
import styled from "styled-components";

const OptionsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

interface Props {
    userHasSignedIn: boolean;
    setManageMode: (mode: ManageMode) => void;
    onCancel: () => void;
}

const ManageUserOptions: React.FC<Props> = ({ userHasSignedIn, setManageMode, onCancel }) => {
    return (
        <>
            <EditSubheading>Options</EditSubheading>
            <OptionsSection>
                <Button
                    variant="outlined"
                    startIcon={<FontAwesomeIcon icon={faUserPen} />}
                    onClick={() => setManageMode("editDetails")}
                >
                    Edit Details
                </Button>
                {userHasSignedIn ? (
                    <Button
                        variant="outlined"
                        startIcon={<FontAwesomeIcon icon={faKey} />}
                        onClick={() => setManageMode("resetPassword")}
                    >
                        Reset Password
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        startIcon={<FontAwesomeIcon icon={faEnvelope} />}
                        onClick={() => setManageMode("resendInvitation")}
                    >
                        Resend Invitation
                    </Button>
                )}
                <Button variant="outlined" color="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </OptionsSection>
        </>
    );
};

export default ManageUserOptions;
