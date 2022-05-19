import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/dist/shared/lib/router/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { ClaimRewardProjectModal } from '../components/claimRewardProjectModal';
import { ConnectWalletModal } from '../components/connectWalletModal';
import { CreateProjectModal } from '../components/createProjectModal';
import { SupportProjectModal } from '../components/supportProjectModal';
import { useApp } from '../hooks/useApp';
import { store } from '../store';
import '../styles/global.less';

const Init = () => {
    useApp();
    return null;
};

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <ChakraProvider>
                    <Init />
                    <ToastContainer />
                    <ConnectWalletModal />
                    <CreateProjectModal />
                    <SupportProjectModal />
                    <ClaimRewardProjectModal />
                    <Component {...pageProps} />
                </ChakraProvider>
            </Provider>
        </QueryClientProvider>
    );
}
