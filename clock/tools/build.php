<?php
declare(strict_types=1);

/**
 * Renders index.php into a PHP-free dist/ tree that can be served by any
 * static host (GitHub Pages, Netlify, S3, nginx, ...).
 *
 * Usage:
 *   php tools/build.php [--out=dist] [--force]
 */

const DEFAULT_OUT_DIR = 'dist';

$root = dirname(__DIR__);
$outDir = DEFAULT_OUT_DIR;
$force = false;

foreach (array_slice($argv, 1) as $arg) {
    if (str_starts_with($arg, '--out=')) {
        $outDir = substr($arg, 6);
    } elseif ($arg === '--force' || $arg === '-f') {
        $force = true;
    } elseif ($arg === '--help' || $arg === '-h') {
        echo "Usage: php tools/build.php [--out=dist] [--force]\n";
        echo "  --out=DIR  output directory, relative to the project root (default: dist)\n";
        echo "  --force    delete the output directory even if it contains unexpected files\n";
        exit(0);
    } else {
        fwrite(STDERR, "Unknown option: {$arg}\n");
        exit(1);
    }
}

if ($outDir === '' || $outDir === '.' || str_contains($outDir, '..')) {
    fwrite(STDERR, "Refusing to use an unsafe output path: {$outDir}\n");
    exit(1);
}

$out = rtrim($root . '/' . $outDir, '/\\');
$staticFiles = [
    'sw.js',
    'manifest.webmanifest',
    'assets',
];

function fail(string $message): never
{
    fwrite(STDERR, "build: {$message}\n");
    exit(1);
}

function relativeTo(string $path, string $root): string
{
    return str_replace('\\', '/', substr($path, strlen($root) + 1));
}

function collectSources(string $root, array $entries): array
{
    $found = [];
    foreach ($entries as $entry) {
        $path = $root . '/' . $entry;
        if (is_file($path)) {
            $found[] = $path;
            continue;
        }
        if (!is_dir($path)) {
            fail("missing source: {$entry}");
        }
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $found[] = $file->getPathname();
            }
        }
    }
    sort($found, SORT_STRING);
    return $found;
}

function copyTree(string $from, string $to): void
{
    if (is_file($from)) {
        if (!is_dir($dir = dirname($to)) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
            fail("cannot create directory: {$dir}");
        }
        if (!copy($from, $to)) {
            fail("cannot copy {$from}");
        }
        return;
    }

    if (!is_dir($to) && !mkdir($to, 0755, true) && !is_dir($to)) {
        fail("cannot create directory: {$to}");
    }

    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($from, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    foreach ($items as $item) {
        $target = $to . substr($item->getPathname(), strlen($from));
        if ($item->isDir()) {
            if (!is_dir($target) && !mkdir($target, 0755, true) && !is_dir($target)) {
                fail("cannot create directory: {$target}");
            }
        } else {
            if (!copy($item->getPathname(), $target)) {
                fail("cannot copy {$item->getPathname()}");
            }
        }
    }
}

function removeTree(string $path): void
{
    if (!file_exists($path) && !is_link($path)) {
        return;
    }
    if (!is_dir($path) || is_link($path)) {
        if (!unlink($path)) {
            fail("cannot delete {$path}");
        }
        return;
    }
    foreach (new DirectoryIterator($path) as $item) {
        if ($item->isDot()) {
            continue;
        }
        removeTree($item->getPathname());
    }
    if (!rmdir($path)) {
        fail("cannot delete {$path}");
    }
}

$allowlist = array_merge($staticFiles, ['index.html', '.nojekyll']);

if (is_dir($out)) {
    $unexpected = [];
    foreach (new DirectoryIterator($out) as $item) {
        if ($item->isDot() || $item->isLink()) {
            continue;
        }
        $name = $item->getFilename();
        if (!in_array($name, $allowlist, true) && !str_starts_with($name, '.')) {
            $unexpected[] = $name;
        }
    }
    if ($unexpected !== [] && !$force) {
        fail(
            "output directory {$outDir}/ holds files this build did not write ("
            . implode(', ', $unexpected)
            . "). Move them or re-run with --force."
        );
    }
    removeTree($out);
}

if (!mkdir($out, 0755, true) && !is_dir($out)) {
    fail("cannot create output directory: {$out}");
}

$sources = collectSources($root, array_merge(['index.php'], $staticFiles));

$hash = hash_init('sha256');
foreach ($sources as $path) {
    hash_update($hash, relativeTo($path, $root) . "\0");
    hash_update($hash, (string) hash_file('sha256', $path));
}
$version = substr(hash_final($hash), 0, 10);

define('TIME_BRIDGE_VERSION', $version);

ob_start();
require $root . '/index.php';
$html = ob_get_clean();

if (!is_string($html) || !str_contains($html, '<!doctype html>')) {
    ob_end_clean();
    fail('index.php did not render a complete HTML document');
}

file_put_contents($out . '/index.html', $html);
foreach ($staticFiles as $entry) {
    copyTree($root . '/' . $entry, $out . '/' . $entry);
}
file_put_contents($out . '/.nojekyll', '');

$built = [];
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($out, FilesystemIterator::SKIP_DOTS)) as $file) {
    if ($file->isFile()) {
        $built[] = $file->getSize();
    }
}

printf(
    "built %s/ (%d files, %s KB)\ncache version: %s\nPHP is not required to serve this directory.\n",
    $outDir,
    count($built),
    number_format(array_sum($built) / 1024, 1),
    $version
);
