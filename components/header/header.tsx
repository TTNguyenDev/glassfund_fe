import { Button, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useHeader } from '../../hooks/useHeader';
import { Brand } from '../brand';
import { HeaderAccount } from '../headerAccount';
import { LoginButton } from '../loginButton';
import classes from './header.module.less';

interface HeaderProps {}

export const Header: React.FunctionComponent<HeaderProps> = () => {
    const {
        authLoading,
        logged,
        userId,
        accountType,
        loginLoading,
        requestLogin,
        logoutLoading,
        requestLogout,
    } = useHeader();

    const menu = React.useMemo(() => {
        return [
            {
                href: '/',
                title: 'Projects',
                matchUrl: ['/'],
            },
            {
                href: `/account/${userId}`,
                title: 'My Projects',
                matchUrl: ['/account/[accountId]'],
            },
        ];
    }, [userId]);

    const router = useRouter();

    const menuComp = React.useMemo(() => {
        return menu.map(({ href, title, matchUrl }) => {
            const isActive = matchUrl.includes(router.pathname);
            return (
                <Link key={title} href={href}>
                    <Button
                        h="100%"
                        borderRadius="none"
                        bg="transparent"
                        borderBottom="solid 3px rgba(231, 234, 246, 1)"
                        _hover={{
                            bg: 'rgba(255, 255, 255, 0.1)',
                            borderImageSlice: 1,
                            borderImageSource: 'var(--primary-gradient)',
                        }}
                        _active={{
                            bg: 'rgba(255, 255, 255, 0.1)',
                            borderImageSlice: 1,
                            borderImageSource: 'var(--primary-gradient)',
                        }}
                        isActive={isActive}
                    >
                        <Text
                            background="var(--primary-gradient)"
                            backgroundClip="text"
                            fontSize="16px"
                            fontWeight="600"
                        >
                            {title}
                        </Text>
                    </Button>
                </Link>
            );
        });
    }, [menu, router.asPath]);

    return (
        <div className={classes.root}>
            <div className={classes.navbar}>
                <div className={classes.navbar_header}>
                    <Brand />
                </div>
                {authLoading ? null : logged ? (
                    <HStack h="100%">
                        {menuComp}
                        <HeaderAccount
                            accountType={accountType}
                            logoutLoading={logoutLoading}
                            requestLogout={requestLogout}
                            accountName={userId!}
                        />
                    </HStack>
                ) : (
                    <LoginButton
                        loading={loginLoading}
                        requestLogin={requestLogin}
                    />
                )}
            </div>
        </div>
    );
};
