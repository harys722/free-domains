// Domains data for Free Domains website
const domainsData = [
    {
        name: "is-a.dev",
        url: "https://www.is-a.dev/",
        description: "Grab your own sweet-looking '.is-a.dev' subdomain.",
        repo: "is-a-dev/register",
        available: true
    },
    {
        name: "js.org",
        url: "https://js.org/",
        description: "Dedicated to JavaScript and its awesome community since 2015",
        repo: "js-org/js.org",
        available: true
    },
    {
        name: "Open Domains",
        url: "https://open-domains.net",
        description: "Free subdomains for personal sites, open-source projects, and more. Offers is-cool.dev, is-a-fullstack.dev, is-local.org, is-not-a.dev, and localplayer.dev.",
        repo: "open-domains/register",
        available: true
    },
    {
        name: "Domains Project",
        url: "https://getyourfree.space/",
        description: "Free developer subdomains under owns.it.com, with more domains coming soon.",
        repo: "domainsproject/register",
        available: true
    },
    {
        name: "name.com",
        url: "https://www.name.com/partner/github-students",
        description: "Name.com has partnered with GitHub to provide free domain names to students. Offering up to 10 free domains including .live, .studio .games, .software & more.",
        repo: null,
        available: true
    },
    {
        name: "DigitalPlat FreeDomain",
        url: "https://domain.digitalplat.org/",
        description: "DigitalPlat FreeDomain: Free Domain For Everyone. We offers .DPDNS.ORG, .US.KG, .QZZ.IO and .XX.KG domain extensions.",
        repo: "DigitalPlatDev/FreeDomain",
        available: true
    },
    {
        name: "Open Host",
        url: "https://registry.openhost.uk/",
        description: "A free subdomain service offering subdomains on prvcy.page, 16-b.it, 32-b.it, 64-b.it, pride.moe and pride.ngo.",
        repo: null,
        available: true
    },
    {
        name: "SubFree Project",
        url: "https://now-is.online/",
        description: "SubFree is a free and simple subdomain service inspired by is-a.dev designed for developers, creators, and builders who want custom subdomains.",
        repo: "rubahilang/SubFree-Project",
        available: true
    },
    {
        name: "foo.ng",
        url: "https://foo.ng/",
        description: "Free foo.ng subdomains for everyone.",
        repo: "Pokymon/foo.ng",
        available: true
    },
    {
        name: "Is-Cool-Me",
        url: "https://is.epic.me",
        description: "Free subdomains for personal sites, open-source projects, and more, offering subdomains on is-epic.me and is-awsm.tech.",
        repo: "is-cool-me/register",
        available: true
    },
    {
        name: "is-a-good.dev",
        url: "https://is-a-good.dev/",
        description: "Register for your is-a-good.dev domain!",
        repo: "is-a-good-dev/register",
        available: true
    },
    {
        name: "is-not.cool",
        url: "https://is-not.cool/",
        description: "Get your own 'is-not.cool' subdomain!",
        repo: "is-not-cool/registration",
        available: true
    },
    {
        name: "is-a.shop",
        url: "https://is-a.shop/",
        description: "Get is-a.shop subdomain for your shop.",
        repo: "is-a-shop/register",
        available: true
    },
    {
        name: "is-an.ai",
        url: "https://is-an.ai/",
        description: "🤖 Free .is-an.ai subdomains for AI projects. No DNS config, no waiting.",
        repo: "is-an-ai/is-an.ai",
        available: true
    },
    {
        name: "is-cod.in",
        url: "https://is-cod.in/",
        description: "Get your website a professional touch with a free is-cod.in domain!",
        repo: "is-cod-in/register",
        available: true
    },
    {
        name: "thedev.id",
        url: "https://thedev.id/",
        description: "An identity for developers on the web.",
        repo: "thedev-id/thedev.id",
        available: true
    },
    {
        name: "thedev.me",
        url: "https://thedev.me/",
        description: "Get your free '{name}.thedev.me' domain.",
        repo: "thedev-me/register",
        available: true
    },
    {
        name: "rweb.site",
        url: "https://rweb.site/",
        description: "Free 'rweb.site' subdomain for personal websites, open-source projects and more.",
        repo: "katorlys/rweb.site",
        available: true
    },
    {
        name: "js.cool",
        url: "https://js.cool/",
        description: "Provide free subdomains for Chinese open source projects (since August 2020), now support Vercel!",
        repo: "willin/domain",
        available: true
    },
    {
        name: "ngo.us",
        url: "https://nic.ngo.us/",
        description: "Free subdomains exclusively for nonprofits, nongovernmental organizations (NGOs) and initiatives.",
        repo: "ngo-us/registry",
        available: true
    },
    {
        name: "pp.ua",
        url: "https://pp.ua/",
        description: "Free pp.ua subdomains.",
        repo: null,
        available: true
    },
    {
        name: "part-of.my.id",
        url: "https://part-of.my.id/",
        description: "Your own personal id for your website.",
        repo: "partofmyid/register",
        available: true
    },
    {
        name: "lgbt.sh",
        url: "https://lgbt.sh/",
        description: "Free lgbt.sh sub-domain registration service.",
        repo: "lgbt-sh/lgbt-sh",
        available: true
    },
    {
        name: "zone.id",
        url: "https://zone.id/",
        description: "Zone.ID is a premium subdomain provider as an alternative to the traditional .id TLD.",
        repo: null,
        available: true
    },
    {
        name: "cli.rs",
        url: "https://cli.rs/",
        description: ".RS is an expensive domain. Use {yourproject}.cli.rs for your Rust projects!",
        repo: "zackify/cli.rs",
        available: true
    },
    {
        name: "mod.land",
        url: "https://mod.land/",
        description: "📦 Pretty subdomains for you deno project.",
        repo: "denosaurs/mod.land",
        available: true
    },
    {
        name: "env.pm",
        url: "https://env.pm/",
        description: "Use the 'env.pm' / 'jsx.pm' subdomains for your projects or personal use.",
        repo: null,
        available: true
    },
    {
        name: "yeet.su",
        url: "https://yeet.su/",
        description: "Launch your web app with a free subdomain on yeet.su. No hidden fees, just simple hosting.",
        repo: null,
        available: true
    },
    {
        name: "creepers.sbs & creepers.cloud",
        url: "https://creepers.sbs/",
        description: "You can register your '.creepers.sbs' / '.creepers.cloud' subdomain completely free.",
        repo: "creepersbs/register",
        available: true
    },
    {
        name: "is-a.software",
        url: "https://is-a.software/",
        description: "Get your free .is-a.software subdomain for developers. Perfect for side projects, demos, and showcasing your work to the world.",
        repo: "is-a-software/software",
        available: true
    },
    {
        name: "is-truly-a.pro",
        url: "https://is-truly-a.pro/",
        description: "Free is-truly-a.pro subdomains, available for everyone!",
        repo: "is-truly-a-pro/register",
        available: false
    },
    {
        name: "jsid.dev",
        url: "https://jsid.dev/",
        description: "JSID.DEV is a free identity for developers on the web. This service offers a handy subdomain like foo.jsid.dev or bar.jsid.dev for use on your static sites via CNAME record.",
        repo: "voidsnam/jsid.dev",
        available: false
    },
    {
        name: "cluster.ws & wip.la",
        url: "https://cluster.ws/",
        description: "Get a cluster.ws & wip.la domain for free and instantly.",
        repo: "Olivr/free-domain",
        available: false
    },
    {
        name: "nyc.mn",
        url: "https://dot.nyc.mn/",
        description: "Stand out in the digital world with a .NYC.mn domain, crafted to showcase your unique connection to New York City.",
        repo: null,
        available: false
    },
    {
        name: "is-an.app",
        url: "https://is-an.app/",
        description: "🌐 DNS configuration for some of my domains. (Not available anymore)",
        repo: "tarampampam/free-domains",
        available: false
    },
    {
        name: "possibly-is.gay",
        url: "https://possibly-is.gay/",
        description: "Self-service possibly-is.gay subdomain registration.",
        repo: "possibly-is-gay/possibly-is-gay",
        available: false
    },
    {
        name: "is-a.co",
        url: "https://is-a.co/",
        description: "🌐 Grab your own subdomain for free Follow the steps listed below to get your own subdomain!",
        repo: "PythonicBoat/is-a.co",
        available: false
    },
    {
        name: "withcoding.me",
        url: "http://withcoding.me/",
        description: "Free subdomain for everyone.",
        repo: "JastinXyz/withcoding.me",
        available: false
    },
    {
        name: "is-amaz.ing",
        url: "https://is-amaz.ing",
        description: "Register your is-amaz.ing project domain here!",
        repo: "is-amazing/register",
        available: false
    },
    {
        name: "stole-my.id",
        url: "https://stole-my.id/",
        description: "stole-my.id is a silly domain made for the silly people!",
        repo: "stole-my-id/registration",
        available: false
    },
    {
        name: "tilde.tk",
        url: "https://tilde.tk/",
        description: "In need of a cool subdomain? And want it to be your own UNIX home directory? Then tilde.tk (~.tk) is right for you",
        repo: "youngchief-btw/tilde.tk",
        available: false
    },
    {
        name: "merahputih.moe",
        url: "https://merahputih.moe/",
        description: "Are you weeb developer looking for free webspace to host your project? Get free subdomain merahputih.moe UwU",
        repo: "ScathachGrip/merahputih.moe",
        available: false
    }
];

// Export for use in main website
if (typeof module !== 'undefined' && module.exports) {
    module.exports = domainsData;
}
