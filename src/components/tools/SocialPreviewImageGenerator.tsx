import React, { useState } from 'react';

export const SocialPreviewImageGenerator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [platform, setPlatform] = useState('facebook');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    // Placeholder for generation logic
    alert('Preview generation feature coming soon!');
  };

  const handleDownload = () => {
    // Placeholder for download logic
    alert('Download feature coming soon!');
  };

  const getPlatformDimensions = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return { width: 1200, height: 630, name: 'Facebook Link Preview' };
      case 'twitter':
        return { width: 1200, height: 675, name: 'Twitter Card' };
      case 'linkedin':
        return { width: 1200, height: 627, name: 'LinkedIn Preview' };
      default:
        return { width: 1200, height: 630, name: 'Social Preview' };
    }
  };

  const dimensions = getPlatformDimensions(platform);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Social Preview Image Generator</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-6">
              {/* Platform Selection */}
              <div className="space-y-2">
                <label className="block text-white font-medium">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-white font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your title"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-white font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter your description"
                  rows={3}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <label className="block text-white font-medium">URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="block text-white font-medium">Logo/Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {logo && (
                  <p className="text-white/70">Selected: {logo.name}</p>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Generate Preview
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                Download Image
              </button>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="text-white font-medium">
                Preview ({dimensions.name} - {dimensions.width}x{dimensions.height})
              </div>
              <div
                className="bg-white rounded-xl p-6 shadow-2xl mx-auto"
                style={{ width: '400px', height: '225px' }}
              >
                <div className="h-full flex flex-col">
                  {/* Image */}
                  <div className="h-3/5 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-500">Image</span>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">
                      {title || 'Your Title Here'}
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      {description || 'Your description will appear here...'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {url || 'example.com'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
