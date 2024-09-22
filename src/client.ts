import { HoudiniClient } from '$houdini';

export default new HoudiniClient({
    url: 'https://aptos-testnet.nodit.io/D94Ju3Hfhk2dI6sh8F3Prj4HwSC5oBup/v1/graphql'

    // uncomment this to configure the network call (for things like authentication)
    // for more information, please visit here: https://www.houdinigraphql.com/guides/authentication
    // fetchParams({ session }) {
    //     return {
    //         headers: {
    //             Authentication: `Bearer ${session.token}`,
    //         }
    //     }
    // }
})
