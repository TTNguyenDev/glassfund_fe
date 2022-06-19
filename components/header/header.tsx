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
                title: 'All Projects',
                matchUrl: ['/'],
            },
            {
                href: `/account/${userId}`,
                title: 'My Profile',
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
                        maxW="200px"
                        h="100%"
                        flex="1"
                        borderRadius="none"
                        bg="transparent"
                        borderBottom="solid 3px var(--text-color)"
                        color="white"
                        _hover={{
                            bg: 'rgba(255, 255, 255, 0.06)',
                            borderImageSlice: 1,
                        }}
                        _active={{
                            bg: 'rgba(255, 255, 255, 0.06)',
                            borderImageSlice: 1,
                            borderImageSource: 'var(--primary-gradient)',
                            borderBottom: 'solid 5.5px rgba(231, 234, 246, 1)',
                            backdropFilter: 'blur(16px)',
                        }}
                        isActive={isActive}
                    >
                        {isActive ? (
                            <Text
                                fontSize="19px"
                                fontWeight="650"
                                background="var(--primary-gradient)"
                                backgroundClip="text"
                            >
                                {title}
                            </Text>
                        ) : (
                            <Text
                                fontSize="17px"
                                fontWeight="600"
                                textColor="var(--ballloon-text-color)"
                            >
                                {title}
                            </Text>
                        )}
                    </Button>
                </Link>
            );
        });
    }, [menu, router.asPath]);

    return (
        <div
            className={classes.root}
            style={{
                position: 'sticky',
                top: 0,
                width: '100%',
                zIndex: 100,
                background: 'rgba(32, 34, 37, 0.4)',
            }}
        >
            <div className={classes.navbar}>
                <div className={classes.navbar_header}>
                    <Brand />
                </div>
                {authLoading ? null : logged ? (
                    <HStack h="100%" flex="1" justifyContent="end">
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
