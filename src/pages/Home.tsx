import { Link } from 'react-router-dom';

const menuItems = [
  'HOME',
  'ORGANISATION',
  'TENDERS',
  'SUGGESTIONS',
  'RTI',
  'MYAS',
  'DASHBOARD',
  'NSS VOLUNTEERS',
  'NEWSLETTER',
  'SUCCESS STORIES/BEST PRACTICES',
  'ICC',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Logo Section */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-0">
          <div className="flex items-center gap-5">
            <img
              src="https://nss.gov.in/sites/all/themes/youthaffair/logo.png"
              alt="NSS Logo"
              className="h-34 object-contain"
            />
          </div>

          <div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyIgiUYbCOlOhfeQeBj4mxI5Og0uFKJdfI3A&s"
              alt="Swachh Bharat"
              className="h-24"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#2d348f]">
        <div className="mx-auto flex max-w-[1600px] items-center overflow-x-auto">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`px-5 py-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-[#ef4a24] ${
                item === 'ORGANISATION' ? 'bg-[#ef4a24]' : ''
              }`}
            >
              {item}
            </button>
          ))}

          {/* Login Button */}
          <Link
            to="/login"
            className="ml-auto bg-green-600 px-6 py-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-green-700"
          >
            LOGIN
          </Link>
        </div>
      </nav>

      {/* Hero Image */}
      <section>
        <img
          src="https://nss.gov.in/sites/all/themes/youthaffair/images/nss.jpg"
          alt="NSS Event"
          className="h-auto w-full object-cover"
        />
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <div className="bg-[#ef4a24] px-5 py-3 text-sm font-medium text-white">
          Home &gt;&gt; About Us 00
        </div>
      </div>

      {/* About Section */}
      <section className="mx-auto max-w-[1200px] px-4 pb-16">
        <h2 className="mb-6 text-3xl font-bold text-[#2d348f]">About National Service Scheme</h2>

        <div className="space-y-4 leading-8 text-gray-700">
          <p>
            The National Service Scheme (NSS) is a Central Sector Scheme of the Government of India,
            Ministry of Youth Affairs & Sports.
          </p>

          <p>
            It provides opportunity to the student youth of schools and colleges to take part in
            various government-led community service activities and programmes.
          </p>

          <p>
            The primary objective of developing the personality and character of the student youth
            through voluntary community service remains unchanged.
          </p>
        </div>
      </section>
    </div>
  );
}
