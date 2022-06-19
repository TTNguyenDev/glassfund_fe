import { Button } from '@chakra-ui/react';
import React from 'react';

interface LoginButtonProps {
    loading: boolean;
    requestLogin: () => void;
}

export const LoginButton: React.FunctionComponent<LoginButtonProps> = ({
    loading,
    requestLogin,
}) => {
    return (
        <Button variant="primary" isLoading={loading} onClick={requestLogin}>
            Connect the wallet
        </Button>
    );
};
