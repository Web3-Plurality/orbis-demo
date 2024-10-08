import { CeramicDocument, OrbisConnectResult, OrbisDB } from "@useorbis/db-sdk";
import { OrbisEVMAuth, OrbisKeyDidAuth } from "@useorbis/db-sdk/auth";


const orbisdb = new OrbisDB({
    ceramic: {
        gateway: process.env.REACT_APP_CERAMIC_URL
    },
    nodes: [
        {
            gateway: process.env.REACT_APP_ORBIS_NODE_URL,
            env: process.env.REACT_APP_ORBIS_ENV
        }
    ]
})

const data = {
    contexts: {
        plurality: process.env.REACT_APP_PLURALITY_CONTEXT,
    },
    models: {
        test_model: process.env.REACT_APP_TEST_MODEL,
        profile_type_model: process.env.REACT_APP_PROFILE_TYPE_MODEL
    }
}

// Will connect user to OrbisDB  Phantom or Metamask 
export async function connectOrbisDidPkh() {
    // Orbis Authenticator, will use Ethereum or Solana auth
    let auth = new OrbisEVMAuth(window.ethereum);

    // Authenticate the user and persist the session in localStorage
    try {
        // By default, sessions are persisted in localStorage and are valid for up to 3 months.
        // In order to bypass this behavior, pass { saveSession: false } to the connectUser method.
        const authResult: OrbisConnectResult = await orbisdb.connectUser({ auth }); 
        if(authResult?.user) {
            return authResult.user;
            //setUser(authResult.user);
        }
        console.log("authResult:", authResult);
        return "";
    } catch(e) {
        console.log("Error connecting user:", e);
        return "";
    }
}
export async function connectOrbisDidKey() {
    // Generate the seed
    const seed = await OrbisKeyDidAuth.generateSeed()
    // Initiate the authneticator using the generated (or persisted) seed
    const auth = await OrbisKeyDidAuth.fromSeed(seed)
    try {    
    // Authenticate the user and persist the session in localStorage
    const authResult: OrbisConnectResult = await orbisdb.connectUser({ auth })
        if(authResult?.user) {
            // Log the result
            console.log({ authResult })
            return authResult.user;
            //setUser(authResult.user);
        }
        console.log("authResult:", authResult);
        return "";
    } catch(e) {
        console.log("Error connecting user:", e);
        return "";
    }
}

// Will reconnect user automatically if we find a session in local storage 
  export async function autoConnect() {
      try {
        const currentUser: OrbisConnectResult | boolean = await orbisdb.getConnectedUser();
        console.log(currentUser);
        if(currentUser) {
            return currentUser.user;
          //setUser(currentUser.user);
        }
        return "";
      }
      catch (error) {
        console.log(error);
        return "";
      }
  }

  /** Will disconnect the user */
 export async function userLogout() {
    try {
      let res = await orbisdb.disconnectUser();
      //setUser(null);
      console.log("res:", res);
      return "done";
    }
    catch (error) {
      console.log(error);
    }
}

 /** Will retrieve the active profile for the connected user */
export async function getMostRecentDataFromTable(did: any) {
    try {
        let _profileRes = await orbisdb.select().from(data.models.test_model).context(process.env.REACT_APP_PLURALITY_CONTEXT)
        .where({"controller": did.toString()}).orderBy(["indexed_at", "desc"]).run();
        if(_profileRes && _profileRes.rows.length > 0) {
            return _profileRes.rows[0];
            //setProfile(_profileRes.rows[0])
        } else {
            return null;
            //setProfile(null);
        }
    } catch(e) {
        console.log("Error retrieving profile:", e);
        return null;
        //setProfile(null);
    }
}

export async function insert() {
    const insertStatement = await orbisdb
    .insert(data.models.test_model)
    .value(
        {
            TestProperty: "test"
        }
    )
    // optionally, you can scope this insert to a specific context
    .context(process.env.REACT_APP_PLURALITY_CONTEXT);

    // Perform local JSON Schema validation before running the query
    const validation: any = await insertStatement.validate()
    if(!validation.valid){
        throw "Error during validation: " + validation.error
    }

    try {
        const result = await insertStatement.run();
        console.log(result);
    }
    catch (error) {
        console.log(error);
    }
    // All runs of a statement are stored within the statement, in case you want to reuse the same statmenet
    console.log(insertStatement.runs)    
 }

 export async function bulkInsert() {
    const insertStatement = await orbisdb
    .insertBulk(data.models.test_model)
    .value(
        {
            TestProperty: "test"
        }
    )
    // optionally, you can scope this insert to a specific context
    .context(process.env.REACT_APP_PLURALITY_CONTEXT);

    // Perform local JSON Schema validation before running the query
    const validation: any = await insertStatement.validate()
    if(!validation.valid){
        throw "Error during validation: " + validation.error
    }

    try {
        const { success, errors } = await insertStatement.run()
        if(errors.length){
            console.error("Errors occurred during execution", errors)
        }
        console.log(success);
    }
    catch (error) {
        console.log(error);
    }
    // All runs of a statement are stored within the statement, in case you want to reuse the same statmenet
    console.log(insertStatement.runs)    
 }

 export async function update(stream_id:string) {
    // This will replace the provided row with provided values
    const updateStatement = await orbisdb
    .update(stream_id)
    .replace(
        {
            TestProperty: "test-updated"
        }
    )

    try {
        const result= await updateStatement.run();
        console.log(result);
    }
    catch (error) {
        console.log(error);
    }

    // All runs of a statement are stored within the statement, in case you want to reuse the same statmenet
    console.log(updateStatement.runs)
 }

 export async function partialUpdate() {
    // This will perform a shallow merge before updating the document 
    // { ...oldContent, ...newContent }
    const updateStatement = await orbisdb
    .update(data.models.test_model)
    .set(
        {
            TestProperty: "test-updated"
        }
    )

    try {
        const result= await updateStatement.run();
        console.log(result);
    }
    catch (error) {
        console.log(error);
    }
    // All runs of a statement are stored within the statement, in case you want to reuse the same statmenet
    console.log(updateStatement.runs)
 }

 export async function select() {
    try {
        let selectStatement = await orbisdb.select().from(data.models.profile_type_model).context(process.env.REACT_APP_PLURALITY_CONTEXT);
        const query = selectStatement.build()
        console.log("Query that will be run", query)
        const result= await selectStatement.run();
        console.log(result);
        // columns: Array<string>
        // rows: Array<T | Record<string, any>>
        const { columns, rows } = result
        console.log({ columns, rows });
        return { columns, rows };
    }
    catch (error) {
      console.log("Error", error)
    }
  }

  export async function insertProfileType() {
    const insertStatement = await orbisdb
    .insert(data.models.profile_type_model)
    .value(
        {
            profile_name: 'Marni Loyalty',
            platforms: '[{"platform":"Instagram","authentication":false},{"platform":"Meta","authentication":false},{"platform":"Twitter","authentication":true},{"platform":"TikTok","authentication":true},{"platform":"Roblox","authentication":true},{"platform":"Snapchat","authentication":true}]',
            version: '1.0',
            description: 'The profile for Marni Loyalty Program'

            // profile_name: 'Fashion Week Connect',
            // platforms: '[{"platform":"Instagram","authentication":true},{"platform":"ArtificialRome","authentication":false},{"platform":"TikTok","authentication":true},{"platform":"Roblox","authentication":true},{"platform":"Snapchat","authentication":true},{"platform":"Spatial","authentication":true},{"platform":"Fortnite","authentication":true},{"platform":"DRESSX","authentication":false}]',
            // version: '1.0',
            // description: 'The profile for DFDC Fashion Week Connect event'

            // profile_name: 'test',
            // platforms: 'test',
            // version: 'test',
            // description: 'test'
        }
    )
    // optionally, you can scope this insert to a specific context
    .context(process.env.REACT_APP_PLURALITY_CONTEXT);

    // Perform local JSON Schema validation before running the query
    const validation: any = await insertStatement.validate()
    if(!validation.valid){
        throw "Error during validation: " + validation.error
    }

    try {
        const result = await insertStatement.run();
        console.log(result);
    }
    catch (error) {
        console.log(error);
    }
    // All runs of a statement are stored within the statement, in case you want to reuse the same statmenet
    console.log(insertStatement.runs)    
 }

 export async function updateProfileType() {
    // This will perform a shallow merge before updating the document 
    // { ...oldContent, ...newContent }
    const updateStatement = await orbisdb
    .update("kjzl6kcym7w8y5lbahgsb1ax59jmgsbrahav26sboushd6x7bcltaq0k37bt8cx")
    .set(
        {
            profile_name: "Marni Loyalty Rewards",
            description: "Earn points by connecting your social profiles",
        }
    )

    try {
        const result= await updateStatement.run();
        console.log(result);
    }
    catch (error) {
        console.log(error);
    }
    // All runs of a statement are stored within the statement, in case you want to reuse the same statmenet
    console.log(updateStatement.runs)
 }