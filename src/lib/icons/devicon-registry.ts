// Static registry of devicons for tech skill icons
// Uses Plain variants where available, Line or Original otherwise, with color="currentColor"
// Individual imports enable tree-shaking - NEVER use named imports from main package

import type { ComponentType, SVGProps } from "react";

// Import icons INDIVIDUALLY for tree-shaking
// Languages - using best available variant for monochrome
import JavascriptPlain from "devicons-react/icons/JavascriptPlain";
import TypescriptPlain from "devicons-react/icons/TypescriptPlain";
import PythonPlain from "devicons-react/icons/PythonPlain";
import JavaPlain from "devicons-react/icons/JavaPlain";
import CLine from "devicons-react/icons/CLine";
import CplusplusPlain from "devicons-react/icons/CplusplusPlain";
import CsharpPlain from "devicons-react/icons/CsharpPlain";
import GoPlain from "devicons-react/icons/GoPlain";
import RustLine from "devicons-react/icons/RustLine";
import RubyPlain from "devicons-react/icons/RubyPlain";
import PhpPlain from "devicons-react/icons/PhpPlain";
import SwiftPlain from "devicons-react/icons/SwiftPlain";
import KotlinPlain from "devicons-react/icons/KotlinPlain";
import ScalaPlain from "devicons-react/icons/ScalaPlain";
import RPlain from "devicons-react/icons/RPlain";
import DartPlain from "devicons-react/icons/DartPlain";
import ElixirPlain from "devicons-react/icons/ElixirPlain";
import HaskellPlain from "devicons-react/icons/HaskellPlain";
import LuaPlain from "devicons-react/icons/LuaPlain";
import PerlPlain from "devicons-react/icons/PerlPlain";
import ClojureLine from "devicons-react/icons/ClojureLine";
import JuliaPlain from "devicons-react/icons/JuliaPlain";
import ErlangPlain from "devicons-react/icons/ErlangPlain";
import ElmPlain from "devicons-react/icons/ElmPlain";

// Frameworks - Frontend
import ReactOriginal from "devicons-react/icons/ReactOriginal";
import VuejsPlain from "devicons-react/icons/VuejsPlain";
import AngularPlain from "devicons-react/icons/AngularPlain";
import SveltePlain from "devicons-react/icons/SveltePlain";
import NextjsPlain from "devicons-react/icons/NextjsPlain";
import NuxtjsPlain from "devicons-react/icons/NuxtjsPlain";
import EmberPlain from "devicons-react/icons/EmberPlain";
import AstroPlain from "devicons-react/icons/AstroPlain";
import SolidjsPlain from "devicons-react/icons/SolidjsPlain";
import GatsbyOriginal from "devicons-react/icons/GatsbyOriginal";
import BootstrapPlain from "devicons-react/icons/BootstrapPlain";
import TailwindcssOriginal from "devicons-react/icons/TailwindcssOriginal";
import SassOriginal from "devicons-react/icons/SassOriginal";
import MaterialuiPlain from "devicons-react/icons/MaterialuiPlain";

// Frameworks - Backend
import NodejsPlain from "devicons-react/icons/NodejsPlain";
import ExpressOriginal from "devicons-react/icons/ExpressOriginal";
import DjangoPlain from "devicons-react/icons/DjangoPlain";
import FlaskOriginal from "devicons-react/icons/FlaskOriginal";
import FastapiPlain from "devicons-react/icons/FastapiPlain";
import SpringOriginal from "devicons-react/icons/SpringOriginal";
import RailsPlain from "devicons-react/icons/RailsPlain";
import LaravelLine from "devicons-react/icons/LaravelLine";
import DotNetPlain from "devicons-react/icons/DotNetPlain";
import PhoenixOriginal from "devicons-react/icons/PhoenixOriginal";
import FastifyPlain from "devicons-react/icons/FastifyPlain";
import NestjsLine from "devicons-react/icons/NestjsLine";

// Databases
import PostgresqlPlain from "devicons-react/icons/PostgresqlPlain";
import MysqlOriginal from "devicons-react/icons/MysqlOriginal";
import MongodbPlain from "devicons-react/icons/MongodbPlain";
import RedisPlain from "devicons-react/icons/RedisPlain";
import SqlitePlain from "devicons-react/icons/SqlitePlain";
import ElasticsearchPlain from "devicons-react/icons/ElasticsearchPlain";
import FirebasePlain from "devicons-react/icons/FirebasePlain";
import SupabasePlain from "devicons-react/icons/SupabasePlain";
import MariadbOriginal from "devicons-react/icons/MariadbOriginal";
import CassandraPlain from "devicons-react/icons/CassandraPlain";
import CouchdbPlain from "devicons-react/icons/CouchdbPlain";
import DynamodbPlain from "devicons-react/icons/DynamodbPlain";
import Neo4jPlain from "devicons-react/icons/Neo4jPlain";

// Cloud
import AzurePlain from "devicons-react/icons/AzurePlain";
import GooglecloudPlain from "devicons-react/icons/GooglecloudPlain";
import CloudflarePlain from "devicons-react/icons/CloudflarePlain";
import DigitaloceanOriginal from "devicons-react/icons/DigitaloceanOriginal";
import HerokuPlain from "devicons-react/icons/HerokuPlain";
import VercelLine from "devicons-react/icons/VercelLine";
import NetlifyPlain from "devicons-react/icons/NetlifyPlain";

// DevOps
import DockerPlain from "devicons-react/icons/DockerPlain";
import KubernetesPlain from "devicons-react/icons/KubernetesPlain";
import GitPlain from "devicons-react/icons/GitPlain";
import GithubOriginal from "devicons-react/icons/GithubOriginal";
import GitlabPlain from "devicons-react/icons/GitlabPlain";
import JenkinsPlain from "devicons-react/icons/JenkinsPlain";
import TerraformPlain from "devicons-react/icons/TerraformPlain";
import AnsiblePlain from "devicons-react/icons/AnsiblePlain";
import LinuxPlain from "devicons-react/icons/LinuxPlain";
import BashPlain from "devicons-react/icons/BashPlain";
import NginxOriginal from "devicons-react/icons/NginxOriginal";
import PrometheusLine from "devicons-react/icons/PrometheusLine";
import GrafanaPlain from "devicons-react/icons/GrafanaPlain";
import CircleciPlain from "devicons-react/icons/CircleciPlain";
import TravisLine from "devicons-react/icons/TravisLine";
import ArgocdPlain from "devicons-react/icons/ArgocdPlain";

// Tools
import VscodePlain from "devicons-react/icons/VscodePlain";
import VimPlain from "devicons-react/icons/VimPlain";
import FigmaPlain from "devicons-react/icons/FigmaPlain";
import PostmanPlain from "devicons-react/icons/PostmanPlain";
import WebpackPlain from "devicons-react/icons/WebpackPlain";
import VitejsPlain from "devicons-react/icons/VitejsPlain";
import NpmOriginalWordmark from "devicons-react/icons/NpmOriginalWordmark";
import YarnLine from "devicons-react/icons/YarnLine";
import JestPlain from "devicons-react/icons/JestPlain";
import CypressioPlain from "devicons-react/icons/CypressioPlain";
import GraphqlPlain from "devicons-react/icons/GraphqlPlain";
import JupyterPlain from "devicons-react/icons/JupyterPlain";
import NeovimPlain from "devicons-react/icons/NeovimPlain";
import IntellijPlain from "devicons-react/icons/IntellijPlain";
import EslintPlain from "devicons-react/icons/EslintPlain";
import GulpPlain from "devicons-react/icons/GulpPlain";
import GruntPlain from "devicons-react/icons/GruntPlain";
import BabelPlain from "devicons-react/icons/BabelPlain";
import PnpmPlain from "devicons-react/icons/PnpmPlain";
import BunPlain from "devicons-react/icons/BunPlain";
import PlaywrightPlain from "devicons-react/icons/PlaywrightPlain";
import VitestPlain from "devicons-react/icons/VitestPlain";
import StorybookPlain from "devicons-react/icons/StorybookPlain";

// Mobile
import FlutterPlain from "devicons-react/icons/FlutterPlain";
import AndroidPlain from "devicons-react/icons/AndroidPlain";
import AppleOriginal from "devicons-react/icons/AppleOriginal";

// Other popular
import Html5Plain from "devicons-react/icons/Html5Plain";
import Css3Plain from "devicons-react/icons/Css3Plain";
import MarkdownOriginal from "devicons-react/icons/MarkdownOriginal";
import PrismaOriginal from "devicons-react/icons/PrismaOriginal";
import TrpcPlain from "devicons-react/icons/TrpcPlain";
import ThreejsOriginal from "devicons-react/icons/ThreejsOriginal";

export type IconCategory = "languages" | "frameworks" | "databases" | "cloud" | "devops" | "tools";

export interface DeviconEntry {
  name: string;
  id: string;
  component: ComponentType<SVGProps<SVGSVGElement>>;
  category: IconCategory;
  aliases: string[];
}

export const DEVICON_REGISTRY: DeviconEntry[] = [
  // Languages (24)
  { name: "JavaScript", id: "javascript", component: JavascriptPlain, category: "languages", aliases: ["js", "ecmascript", "es6", "es2015"] },
  { name: "TypeScript", id: "typescript", component: TypescriptPlain, category: "languages", aliases: ["ts"] },
  { name: "Python", id: "python", component: PythonPlain, category: "languages", aliases: ["python3", "py"] },
  { name: "Java", id: "java", component: JavaPlain, category: "languages", aliases: ["jdk", "jre"] },
  { name: "C", id: "c", component: CLine, category: "languages", aliases: ["clang"] },
  { name: "C++", id: "cplusplus", component: CplusplusPlain, category: "languages", aliases: ["cpp", "c++"] },
  { name: "C#", id: "csharp", component: CsharpPlain, category: "languages", aliases: ["c#", "dotnet-lang"] },
  { name: "Go", id: "go", component: GoPlain, category: "languages", aliases: ["golang"] },
  { name: "Rust", id: "rust", component: RustLine, category: "languages", aliases: ["rustlang"] },
  { name: "Ruby", id: "ruby", component: RubyPlain, category: "languages", aliases: ["rb"] },
  { name: "PHP", id: "php", component: PhpPlain, category: "languages", aliases: ["php8", "php7"] },
  { name: "Swift", id: "swift", component: SwiftPlain, category: "languages", aliases: ["swiftlang"] },
  { name: "Kotlin", id: "kotlin", component: KotlinPlain, category: "languages", aliases: ["kt"] },
  { name: "Scala", id: "scala", component: ScalaPlain, category: "languages", aliases: [] },
  { name: "R", id: "r", component: RPlain, category: "languages", aliases: ["rlang", "r-lang"] },
  { name: "Dart", id: "dart", component: DartPlain, category: "languages", aliases: [] },
  { name: "Elixir", id: "elixir", component: ElixirPlain, category: "languages", aliases: [] },
  { name: "Haskell", id: "haskell", component: HaskellPlain, category: "languages", aliases: ["hs"] },
  { name: "Lua", id: "lua", component: LuaPlain, category: "languages", aliases: [] },
  { name: "Perl", id: "perl", component: PerlPlain, category: "languages", aliases: ["pl"] },
  { name: "Clojure", id: "clojure", component: ClojureLine, category: "languages", aliases: ["clj"] },
  { name: "Julia", id: "julia", component: JuliaPlain, category: "languages", aliases: ["jl"] },
  { name: "Erlang", id: "erlang", component: ErlangPlain, category: "languages", aliases: ["erl"] },
  { name: "Elm", id: "elm", component: ElmPlain, category: "languages", aliases: [] },

  // Frameworks - Frontend (14)
  { name: "React", id: "react", component: ReactOriginal, category: "frameworks", aliases: ["reactjs", "react.js", "react js"] },
  { name: "Vue.js", id: "vuejs", component: VuejsPlain, category: "frameworks", aliases: ["vue", "vue3", "vuejs"] },
  { name: "Angular", id: "angular", component: AngularPlain, category: "frameworks", aliases: ["angularjs", "angular.js"] },
  { name: "Svelte", id: "svelte", component: SveltePlain, category: "frameworks", aliases: ["sveltejs"] },
  { name: "Next.js", id: "nextjs", component: NextjsPlain, category: "frameworks", aliases: ["next", "nextjs"] },
  { name: "Nuxt.js", id: "nuxtjs", component: NuxtjsPlain, category: "frameworks", aliases: ["nuxt", "nuxtjs"] },
  { name: "Ember.js", id: "ember", component: EmberPlain, category: "frameworks", aliases: ["emberjs", "ember.js"] },
  { name: "Astro", id: "astro", component: AstroPlain, category: "frameworks", aliases: ["astrojs"] },
  { name: "SolidJS", id: "solidjs", component: SolidjsPlain, category: "frameworks", aliases: ["solid", "solid-js"] },
  { name: "Gatsby", id: "gatsby", component: GatsbyOriginal, category: "frameworks", aliases: ["gatsbyjs"] },
  { name: "Bootstrap", id: "bootstrap", component: BootstrapPlain, category: "frameworks", aliases: ["bs", "bootstrap5"] },
  { name: "Tailwind CSS", id: "tailwindcss", component: TailwindcssOriginal, category: "frameworks", aliases: ["tailwind", "tw"] },
  { name: "Sass", id: "sass", component: SassOriginal, category: "frameworks", aliases: ["scss"] },
  { name: "Material UI", id: "materialui", component: MaterialuiPlain, category: "frameworks", aliases: ["mui", "material-ui"] },

  // Frameworks - Backend (12)
  { name: "Node.js", id: "nodejs", component: NodejsPlain, category: "frameworks", aliases: ["node", "node.js"] },
  { name: "Express", id: "express", component: ExpressOriginal, category: "frameworks", aliases: ["expressjs", "express.js"] },
  { name: "Django", id: "django", component: DjangoPlain, category: "frameworks", aliases: [] },
  { name: "Flask", id: "flask", component: FlaskOriginal, category: "frameworks", aliases: [] },
  { name: "FastAPI", id: "fastapi", component: FastapiPlain, category: "frameworks", aliases: [] },
  { name: "Spring", id: "spring", component: SpringOriginal, category: "frameworks", aliases: ["springboot", "spring boot"] },
  { name: "Rails", id: "rails", component: RailsPlain, category: "frameworks", aliases: ["ruby on rails", "rubyonrails", "ror"] },
  { name: "Laravel", id: "laravel", component: LaravelLine, category: "frameworks", aliases: [] },
  { name: ".NET", id: "dotnet", component: DotNetPlain, category: "frameworks", aliases: ["dotnet core", ".net core", "aspnet"] },
  { name: "Phoenix", id: "phoenix", component: PhoenixOriginal, category: "frameworks", aliases: ["phoenix framework"] },
  { name: "Fastify", id: "fastify", component: FastifyPlain, category: "frameworks", aliases: [] },
  { name: "NestJS", id: "nestjs", component: NestjsLine, category: "frameworks", aliases: ["nest", "nest.js"] },

  // Databases (13)
  { name: "PostgreSQL", id: "postgresql", component: PostgresqlPlain, category: "databases", aliases: ["postgres", "psql", "pg"] },
  { name: "MySQL", id: "mysql", component: MysqlOriginal, category: "databases", aliases: ["mariadb-alt"] },
  { name: "MongoDB", id: "mongodb", component: MongodbPlain, category: "databases", aliases: ["mongo"] },
  { name: "Redis", id: "redis", component: RedisPlain, category: "databases", aliases: [] },
  { name: "SQLite", id: "sqlite", component: SqlitePlain, category: "databases", aliases: ["sqlite3"] },
  { name: "Elasticsearch", id: "elasticsearch", component: ElasticsearchPlain, category: "databases", aliases: ["elastic", "es"] },
  { name: "Firebase", id: "firebase", component: FirebasePlain, category: "databases", aliases: ["firestore"] },
  { name: "Supabase", id: "supabase", component: SupabasePlain, category: "databases", aliases: [] },
  { name: "MariaDB", id: "mariadb", component: MariadbOriginal, category: "databases", aliases: [] },
  { name: "Cassandra", id: "cassandra", component: CassandraPlain, category: "databases", aliases: ["apache cassandra"] },
  { name: "CouchDB", id: "couchdb", component: CouchdbPlain, category: "databases", aliases: ["couch"] },
  { name: "DynamoDB", id: "dynamodb", component: DynamodbPlain, category: "databases", aliases: ["aws dynamodb", "dynamo"] },
  { name: "Neo4j", id: "neo4j", component: Neo4jPlain, category: "databases", aliases: ["neo"] },

  // Cloud (7)
  { name: "Azure", id: "azure", component: AzurePlain, category: "cloud", aliases: ["microsoft azure", "ms azure"] },
  { name: "Google Cloud", id: "googlecloud", component: GooglecloudPlain, category: "cloud", aliases: ["gcp", "google cloud platform"] },
  { name: "Cloudflare", id: "cloudflare", component: CloudflarePlain, category: "cloud", aliases: ["cf"] },
  { name: "DigitalOcean", id: "digitalocean", component: DigitaloceanOriginal, category: "cloud", aliases: ["do", "digital ocean"] },
  { name: "Heroku", id: "heroku", component: HerokuPlain, category: "cloud", aliases: [] },
  { name: "Vercel", id: "vercel", component: VercelLine, category: "cloud", aliases: ["zeit", "now"] },
  { name: "Netlify", id: "netlify", component: NetlifyPlain, category: "cloud", aliases: [] },

  // DevOps (16)
  { name: "Docker", id: "docker", component: DockerPlain, category: "devops", aliases: ["container", "dockerfile"] },
  { name: "Kubernetes", id: "kubernetes", component: KubernetesPlain, category: "devops", aliases: ["k8s", "kube"] },
  { name: "Git", id: "git", component: GitPlain, category: "devops", aliases: [] },
  { name: "GitHub", id: "github", component: GithubOriginal, category: "devops", aliases: ["gh"] },
  { name: "GitLab", id: "gitlab", component: GitlabPlain, category: "devops", aliases: ["gl"] },
  { name: "Jenkins", id: "jenkins", component: JenkinsPlain, category: "devops", aliases: [] },
  { name: "Terraform", id: "terraform", component: TerraformPlain, category: "devops", aliases: ["tf", "hcl"] },
  { name: "Ansible", id: "ansible", component: AnsiblePlain, category: "devops", aliases: [] },
  { name: "Linux", id: "linux", component: LinuxPlain, category: "devops", aliases: ["unix", "gnu/linux"] },
  { name: "Bash", id: "bash", component: BashPlain, category: "devops", aliases: ["shell", "sh", "zsh"] },
  { name: "Nginx", id: "nginx", component: NginxOriginal, category: "devops", aliases: ["web server"] },
  { name: "Prometheus", id: "prometheus", component: PrometheusLine, category: "devops", aliases: ["prom"] },
  { name: "Grafana", id: "grafana", component: GrafanaPlain, category: "devops", aliases: [] },
  { name: "CircleCI", id: "circleci", component: CircleciPlain, category: "devops", aliases: ["circle ci"] },
  { name: "Travis CI", id: "travisci", component: TravisLine, category: "devops", aliases: ["travis"] },
  { name: "Argo CD", id: "argocd", component: ArgocdPlain, category: "devops", aliases: ["argo", "argocd"] },

  // Tools (22)
  { name: "VS Code", id: "vscode", component: VscodePlain, category: "tools", aliases: ["visual studio code", "vsc"] },
  { name: "Vim", id: "vim", component: VimPlain, category: "tools", aliases: ["vi"] },
  { name: "Neovim", id: "neovim", component: NeovimPlain, category: "tools", aliases: ["nvim"] },
  { name: "IntelliJ IDEA", id: "intellij", component: IntellijPlain, category: "tools", aliases: ["intellij idea", "idea"] },
  { name: "Figma", id: "figma", component: FigmaPlain, category: "tools", aliases: [] },
  { name: "Postman", id: "postman", component: PostmanPlain, category: "tools", aliases: [] },
  { name: "Webpack", id: "webpack", component: WebpackPlain, category: "tools", aliases: [] },
  { name: "Vite", id: "vitejs", component: VitejsPlain, category: "tools", aliases: ["vite"] },
  { name: "npm", id: "npm", component: NpmOriginalWordmark, category: "tools", aliases: ["node package manager"] },
  { name: "Yarn", id: "yarn", component: YarnLine, category: "tools", aliases: [] },
  { name: "pnpm", id: "pnpm", component: PnpmPlain, category: "tools", aliases: [] },
  { name: "Bun", id: "bun", component: BunPlain, category: "tools", aliases: ["bunjs"] },
  { name: "Jest", id: "jest", component: JestPlain, category: "tools", aliases: [] },
  { name: "Vitest", id: "vitest", component: VitestPlain, category: "tools", aliases: [] },
  { name: "Cypress", id: "cypressio", component: CypressioPlain, category: "tools", aliases: ["cypress", "cypress.io"] },
  { name: "Playwright", id: "playwright", component: PlaywrightPlain, category: "tools", aliases: [] },
  { name: "GraphQL", id: "graphql", component: GraphqlPlain, category: "tools", aliases: ["gql"] },
  { name: "Jupyter", id: "jupyter", component: JupyterPlain, category: "tools", aliases: ["jupyter notebook", "ipynb"] },
  { name: "ESLint", id: "eslint", component: EslintPlain, category: "tools", aliases: [] },
  { name: "Gulp", id: "gulp", component: GulpPlain, category: "tools", aliases: ["gulpjs"] },
  { name: "Grunt", id: "grunt", component: GruntPlain, category: "tools", aliases: ["gruntjs"] },
  { name: "Babel", id: "babel", component: BabelPlain, category: "tools", aliases: ["babeljs"] },
  { name: "Storybook", id: "storybook", component: StorybookPlain, category: "tools", aliases: [] },

  // Mobile (3)
  { name: "Flutter", id: "flutter", component: FlutterPlain, category: "frameworks", aliases: [] },
  { name: "Android", id: "android", component: AndroidPlain, category: "frameworks", aliases: ["android sdk"] },
  { name: "iOS", id: "apple", component: AppleOriginal, category: "frameworks", aliases: ["ios", "macos", "swift ui"] },

  // Other popular (6)
  { name: "HTML5", id: "html5", component: Html5Plain, category: "languages", aliases: ["html"] },
  { name: "CSS3", id: "css3", component: Css3Plain, category: "languages", aliases: ["css"] },
  { name: "Markdown", id: "markdown", component: MarkdownOriginal, category: "languages", aliases: ["md"] },
  { name: "Prisma", id: "prisma", component: PrismaOriginal, category: "tools", aliases: ["prisma orm"] },
  { name: "tRPC", id: "trpc", component: TrpcPlain, category: "tools", aliases: [] },
  { name: "Three.js", id: "threejs", component: ThreejsOriginal, category: "frameworks", aliases: ["three", "webgl"] },
];

// Map for O(1) lookup by id
export const DEVICON_MAP = new Map<string, DeviconEntry>(
  DEVICON_REGISTRY.map((icon) => [icon.id, icon])
);
