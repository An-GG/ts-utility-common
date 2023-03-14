import { stdin, stdout, argv } from "process"
import { log } from "console"
import * as repl from "repl";
import * as proc from "process"
const write = stdout.write;

/** Generate random string. */
function random_string(len:number, using?: {numbers?:true, capsletters?:true, lowercaseletters?:true, other?: string}) {
    using = using ? using : {numbers:true, capsletters:true, lowercaseletters:true}
    const charset = 
        using.numbers ? '0123456789' : '' + 
        using.capsletters ? 'ABCDEFGHIJKLMNOPQRSTUVWXTZ' : '' +
        using.lowercaseletters ? 'abcdefghiklmnopqrstuvwxyz' : '' +
        using.other ? using.other! : '';
    if (charset.length == 0) { throw new Error('No chars in charset.'); }
    return new Array(len)
        .fill(null)
        .map(() => charset.charAt(Math.floor(Math.random() * charset.length)))
        .join('');
}

/** Asynchronously wait for n milliseconds, then resolve. */
async function delay_ms(n:number):Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, n);
    })
}

/** Get user input from stdin. */
async function input() {
    let piped_input = "";
    for await (const s of stdin) {
        piped_input += s;
    }
    return piped_input;
}

/** Get command line arguments, starting from the first real argument. Use include_prefix to get the node executable and script file as the first 2 args. */
function args(include_prefix?: true) {
    return process.argv.slice(include_prefix ? 0 : 2);
}

/** Launch a REPL with the given context. */
function injectREPL (context?:{ [k:string]:any }) {
    let dbg: { activeREPL: repl.REPLServer, ctx: { [k:string]:any } } = {} as any
    (global as any).dbg = dbg;

    dbg.activeREPL = repl.start({ useGlobal: true, input: proc.stdin, output: proc.stdout }); 
    dbg.ctx = context ? context : {}

    let getctx = (passThis?:{ [k:string]:string })=>{
        passThis = passThis ? passThis : (global as {})
        for (let k in dbg.ctx) {
            passThis[k]=dbg.ctx[k];
        }
        console.table(Object.keys(dbg.ctx))
        console.log("REPL context has been updated with these keys")
    }   
    dbg.activeREPL.write('let getctx = ' + getctx.toString() + '\n');
    dbg.activeREPL.write('getctx(this)\n');
    return dbg
}



export {
    log,
    write,
    random_string,
    delay_ms,
    input,
    args,
    injectREPL
}



