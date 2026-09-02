export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Woke Soul. 一片流动盛宴，一个充满爱与善良的博客
        </p>
      </div>
    </footer>
  );
}