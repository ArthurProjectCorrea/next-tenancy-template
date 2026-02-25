import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <h1>Taxing Laughter: The Joke Tax Chronicles</h1>
        <h2>The People of the Kingdom</h2>
        <h3>The Joke Tax</h3>
        <h4>People stopped telling jokes</h4>
        <p>
          The king, seeing how much happier his subjects were, realized the
          error of his ways and repealed the joke tax.
        </p>
        <blockquote>
          &quot;After all,&quot; he said, &quot;everyone enjoys a good joke, so
          it&apos;s only fair that they should pay for the privilege.&quot;
        </blockquote>
        <ul>
          <li>1st level of puns: 5 gold coins</li>
          <li>2nd level of jokes: 10 gold coins</li>
          <li>3rd level of one-liners : 20 gold coins</li>
        </ul>
        <code>@radix-ui/react-alert-dialog</code>
        <p className="Lead">
          A modal dialog that interrupts the user with important content and
          expects a response.
        </p>
        <div>Are you absolutely sure?</div>
        <small>Email address</small>
        <p className="Muted">Enter your email address.</p>
      </main>
    </div>
  );
}
