import * as path from 'path'
import * as fs from 'fs-extra'

import simpleGit, { SimpleGit } from 'simple-git'

const localCheckoutDir = path.posix.join(__dirname, '.local-deploy-sourcegraph')

export interface PrepareOptions {
    skipCleanup?: boolean
}

export async function cloneLocalDSCheckout(ref: string, options?: PrepareOptions): Promise<string> {
    const opts: PrepareOptions = {
        skipCleanup: false,
        ...options,
    }

    if (!opts.skipCleanup) {
        await fs.remove(localCheckoutDir)
    }
    await fs.mkdirp(localCheckoutDir)

    const git: SimpleGit = simpleGit({
        baseDir: localCheckoutDir,
    })

    const cloneURL = 'https://github.com/sourcegraph/deploy-sourcegraph.git'

    await git
        .init()
        .addRemote('upstream', cloneURL)
        .fetch('upstream', ref, {
            '--depth': '1',
        })
        .checkout('FETCH_HEAD')

    return localCheckoutDir
}
