import React from "react";

type ShowIfProps = {
    if: boolean;
    children?: React.ReactNode;
}

export default function ShowIf(props: ShowIfProps) {
    return (
        <>
            {props.if && props.children}
        </>
    )
}