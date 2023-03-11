interface PromiseConstructor {
    delay(ms: number): Promise<void>;
}

Promise.delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

declare type CallWhenProps = {
    predicate: () => boolean | Promise<boolean>;
    action: () => void | Promise<void>;

    endless?: boolean;

    checkInterval?: number;
}
const callWhen = async ({predicate, action, endless = false, checkInterval = 1000}: CallWhenProps) => {
    while (true) {
        if (predicate()) {
            console.log('calling action');
            action();
            if (!endless) {
                break;
            }
        }
        await Promise.delay(checkInterval);
    }
};
