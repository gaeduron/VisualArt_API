import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from os import listdir
from os.path import isfile, join
import pandas as pd
from typing import Tuple, List
from mpl_toolkits.axes_grid1 import make_axes_locatable

def import_test():
    return "Import successful!"

def interface():
    from ipyfilechooser import FileChooser
    from IPython.display import Javascript, display
    from ipywidgets import widgets

    # Create and display a FileChooser widget
    fc = FileChooser()
    display(fc)

    options = {
        "path": fc,
    }

    def run_script(ev):
        get_image_error_score(options["path"].selected)

    button = widgets.Button(description="Compute error")
    button.on_click(run_script)
    display(button)
    
def generate_report(folder_path, bg_transparent=False):
    images_paths = onlyfiles = [f for f in listdir(folder_path) if isfile(join(folder_path, f))]
    scores = {}
    for path in images_paths:
        scores[path] = get_image_error_score(folder_path + path, 1, bg_transparent)

        
    df = pd.DataFrame(scores).T
    
    print("\n____ REPORT ____")
    print("STATS:")
    print(f"Studies count: {df['top_5'].count()}")
    print(f"Average error: {round(df['top_5'].mean(),1)}")
    print(f"Minumum error: {df['top_5'].min()}")
    print(f"Maximum error: {df['top_5'].max()}")
    
    bins_range = np.arange(0,df['top_5'].max().astype(int) + 2)
    df['top_5'].hist(bins=bins_range)
    plt.show()
    plot_studies(df, folder_path, bg_transparent)
    return scores, df

def get_image_report(image_path: str, bg_color: str) -> Tuple[str, dict, List[str]]:
    is_transparent = bg_color == "transparent"
    eval_text, eval_dict, eval_image = get_image_error_score(image_path, visual=2, bg_transparent=is_transparent)
    return eval_text, eval_dict, [eval_image]

def get_batch_images_report(images_path: List[str], bg_color: str) -> List[List]:
    is_transparent = bg_color == "transparent"
    scores = []
    for path in images_path:
        eval_text, eval_dict, eval_image = get_image_error_score(path, visual=2, bg_transparent=is_transparent)
        scores.append([path, eval_dict["top_5_error"], eval_dict["mean_error"], eval_dict["pixel_count"], eval_image])
    return scores


def plot_studies(df, folder_path, bg_transparent=False, worst=2, best=2):
    sorted_df = df[['top_5']].sort_values('top_5')
    worst_range = list(range(-worst, 0))
    best_range = list(range(0, best))
    average_range = df.shape[0] // 2
    images = {
        "worst": list(sorted_df.iloc[worst_range].index),
        "best": list(sorted_df.iloc[best_range].index),
        "average": list(sorted_df.iloc[[average_range]].index)
    }

    print(f"\n_____________\nWorst {worst} stud{'ies' if worst > 1 else 'y'}")
    for image in images["worst"]:
        get_image_error_score(folder_path + image,2 , bg_transparent)
          
    print(f"\n_____________\nBest {best} stud{'ies' if best > 1 else 'y'}")
    for image in images["best"]:
        get_image_error_score(folder_path + image,2 , bg_transparent)

    print(f"\n_____________\nAverage study exemple")
    get_image_error_score(folder_path + images["average"][0], 2, bg_transparent)
    

def get_image_error_score(path, visual=2, bg_transparent=False):
    image = load_observation(path, bg_transparent)
    images = get_reference_and_observation(image)
    white_pixel = 0 if bg_transparent else 255
    reference_pixels = np.asarray(np.where(images["reference"] != white_pixel)).T
    observation_pixels = np.asarray(np.where(images["observation"] != white_pixel)).T
    empty_heatmap = np.full(images["reference"].shape, -1)

    reference_heatmap = fill_heatmap(reference_pixels, np.copy(empty_heatmap))
    observation_heatmap = fill_heatmap(observation_pixels, np.copy(empty_heatmap))
    error_percentage = get_error_percentage(reference_heatmap, observation_heatmap, reference_pixels, observation_pixels)
    
    if (visual == 2):
        evaluation, eval_dict = visualize_error(reference_heatmap, observation_pixels, error_percentage)
        fig = plt.figure(frameon=False)
        ax = fig.add_axes([0, 0, 1, 1])
        fig.set_size_inches((6,6))
        ax.set_xlim(0, 10)
        ax.set_ylim(10, 0)
        im = ax.imshow(error_percentage["grid"]/5, cmap='binary', interpolation='none', extent=[0,10,10,0])

        ax.scatter(observation_pixels[:,1]/50.0,observation_pixels[:,0]/50.0, color='r', s=1)
        ax.scatter(reference_pixels[:,1]/50.0,reference_pixels[:,0]/50.0, color='c', s=1)
        ax.tick_params(left = False, right = False, labelleft = False, labelbottom = False, bottom = False, top = False)

        divider = make_axes_locatable(ax)
        ax_cb = divider.append_axes("right", size="4%", pad=0.4)
        fig.add_axes(ax_cb)
        plt.colorbar(im, cax=ax_cb)
        ax_cb.yaxis.tick_left()
        ax_cb.yaxis.set_tick_params(labelright=False)
        fig.canvas.draw()
        eval_image = np.frombuffer(fig.canvas.tostring_rgb(), dtype=np.uint8)
        eval_image = eval_image.reshape(fig.canvas.get_width_height()[::-1] + (3,))
        eval_dict["pixel_count"] = len(reference_pixels)
        return evaluation, eval_dict, eval_image
    elif (visual == 1):
        print(f"...{path[-40:]} => top 5: {error_percentage['top_5']}%")

    return error_percentage

def load_observation(image_path, bg_transparent=False):
    img = Image.open(image_path)
    img_array = np.array(img)
    if (bg_transparent):
        return img_array[:,:,3]
    return img_array[:,:,0]

def get_reference_and_observation(img):
    return {"reference": img[:500,:500], "observation": img[:500,510:]}

def fill_heatmap(zero_error, heatmap):
    last_weights = zero_error.tolist()
    for position in last_weights:
        y, x = position[0], position[1]
        heatmap[y, x] = 0

    weight = 1
    while len(last_weights) > 0:
        next_weights = []

        for position in last_weights:
            y, x = position[0], position[1]
            # generate next_weight
            if (x+1 <= 499 and x+1 >= 0) and heatmap[y, x+1] == -1:
                next_weights += [[y, x+1]]
                heatmap[y, x+1] = weight
            if (x-1 <= 499 and x-1 >= 0) and heatmap[y, x-1] == -1:
                next_weights += [[y, x-1]]
                heatmap[y, x-1] = weight
            if (y+1 <= 499 and y+1 >= 0) and heatmap[y+1, x] == -1:
                next_weights += [[y+1, x]]
                heatmap[y+1, x] = weight
            if (y-1 <= 499 and y-1 >= 0) and heatmap[y-1, x] == -1:
                next_weights += [[y-1, x]]
                heatmap[y-1, x] = weight
        weight += 1

        last_weights = next_weights
    return heatmap

def get_error_percentage(reference_heatmap, observation_heatmap, reference_pixels, observation_pixels):
    errors = []
    grid_size = 10
    image_size = 500
    chunk_size = image_size // grid_size
    grid_ranges = np.zeros([grid_size, grid_size], dtype=int)
    for position in observation_pixels:
        y, x = position[0], position[1]
        errors.append(reference_heatmap[y,x])
        if grid_ranges[y // chunk_size][x // chunk_size] < reference_heatmap[y,x]:
          grid_ranges[y // chunk_size][x // chunk_size] = reference_heatmap[y,x]

    for position in reference_pixels:
        y, x = position[0], position[1]
        errors.append(observation_heatmap[y,x])
        if grid_ranges[y // chunk_size][x // chunk_size] < observation_heatmap[y,x]:
          grid_ranges[y // chunk_size][x // chunk_size] = observation_heatmap[y,x]

    errors.sort()
    top_error = np.asarray(errors[-5:])
    top_error_percentage = round(((top_error.sum()/5)/500)*100, 1)
          
    top_5_error = round(np.sort(grid_ranges.flatten())[-5:].mean()/5,1)

    mean_error = np.asarray(errors).mean()
    mean_error_percentage = round((mean_error/500)*100, 1)

    return {"top_5": top_5_error,"top_error": top_error_percentage, "mean": mean_error_percentage, "grid": grid_ranges}

def visualize_error(heatmap, observation_pixels, error_percentage):
    for position in observation_pixels:
        y, x = position[0], position[1]
        heatmap[y,x] = 300

    plt.figure(figsize = (8,8))
    plt.imshow(np.log(heatmap), cmap="binary", aspect='auto')
    plt.show()
    top_5_error = round(np.sort(error_percentage['grid'].flatten())[-5:].mean()/5,1)
    evaluation = f"Top 5 error: {top_5_error}%\nMean error: {error_percentage['mean']}%"
    eval_dict = {"top_5_error": top_5_error, "mean_error": error_percentage['mean']}
    print(evaluation)
    return evaluation, eval_dict