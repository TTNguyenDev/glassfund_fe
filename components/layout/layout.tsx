import React from 'react';
import { Header } from '../header';
import { Container, Content } from 'rsuite';
import { Footer } from '../footer';
import { background, Box } from '@chakra-ui/react';
import { HeaderLandingPage } from '../headerLandingPage';

type LayoutProps = {
    activeKey?: string;
    children?: React.ReactNode;
};

export const Layout: React.FunctionComponent<LayoutProps> = ({
    activeKey,
    children,
}) => {
    return (
        <Container> 
        <img
            src='/bg.jpg'
            style={{
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                mixBlendMode: 'multiply',
            }}
        />
        <div style={{ position: 'absolute', width: '100%' }}>
            {activeKey === 'landing_page' ? <HeaderLandingPage /> : <Header />}
            <Content>
                <Box minH="calc(100vh - 200px)">{children}</Box>
            </Content>
            <Footer />
            </div>
        </Container>
    );
};
