import {
    commands,
    ExtensionContext,
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    services,
    window,
    workspace,
} from 'coc.nvim';
import { lspName } from './constants';

export async function activate(context: ExtensionContext) {
    let client: LanguageClient;
    const config = workspace.getConfiguration('zig');

    let enabled = config.get('enabled', true);

    workspace.onDidChangeConfiguration(e => {
        if (!e.affectsConfiguration('zig')) return;
        const config = workspace.getConfiguration('zig');
        const newEnabled = config.get('enabled', true);
        if (enabled !== newEnabled) {
            if (newEnabled) {
                window.showInformationMessage(
                    `Please reload the window to enable the Zig Language Server.`
                );
            } else if (client) {
                client.stop();
            }
        }
    });

    if (!enabled) {
        return;
    }

    const command = config.get('path', '');

    if (!command) {
        return window.showErrorMessage(
            'Failed to find the zls executable! Please specify its path in your settings.'
        );
    }

    const serverOptions: ServerOptions = {
        command,
        args: config.get('debugLog', false) ? ['--debug-log'] : [],
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'zig' }],
        outputChannel: window.createOutputChannel('Zig Language Server'),
    };

    client = new LanguageClient('zls', lspName, serverOptions, clientOptions);

    context.subscriptions.push(services.registerLanguageClient(client));

    if (config.get('startUpMessage', true)) {
        window.showInformationMessage(`${lspName} running!`);
    }

    commands.registerCommand('zig.start', client.start);

    commands.registerCommand('zig.stop', client.stop);

    commands.registerCommand('zig.restart', async () => {
        window.showInformationMessage('Restarting Zig Language Server...');
        await client.stop();
        client.start();
    });
}
