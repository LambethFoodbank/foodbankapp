import { faWarning } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Icon from "@/components/Icons/Icon";

const ClientOutsideDeliveryAreaIcon: React.FC = () => {
    return <Icon icon={faWarning} onHoverText="Outside Delivery Area" color="#B8860B" />;
};

export default ClientOutsideDeliveryAreaIcon;
